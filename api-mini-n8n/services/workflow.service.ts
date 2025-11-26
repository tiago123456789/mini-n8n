import { BusinessException } from "../exception/business.exception";
import { NotFoundException } from "../exception/not-found.exception";
import WorkflowExecutionModel from "../models/workflow-execution.model";
import CustomNodeRepository from "../repositories/custom-node.repository";
import WorkflowRepository from "../repositories/workflow.repository";
import CustomNodeManager from "../utils/custom-node-manager.util";
import Encrypter from "../utils/encrypter.util";
import PackageUtil from "../utils/package.util";
import WorkflowUtil from "../utils/workflow.util";
import WorkflowEngine from "../workflow/workflow-engine";
import { randomUUID } from "crypto";

const PREFIX_IDENTIFY_ENCRYPTED_KEY = "ENCRYPTED_";
class WorkflowService {

    constructor(
        private workflowRepository: WorkflowRepository,
        private customNodeRepository: CustomNodeRepository,
        private encrypter: Encrypter,
        private workflowUtil: WorkflowUtil
    ) {
    }

    async getWorkflows() {
        const workflows = await this.workflowRepository.findAll();
        return workflows;
    }

    async runWorkflow(data: {
        sensitiveData: Array<{ key: string, value: string }>,
        isEditMode: boolean,
        workflowId: string,
        nodes: Array<any>,
        contextVariables: Array<any>,
        body: any,
        query: any,
        params: any,
        headers: any,
    }): Promise<Array<{ [key: string]: any }>> {
        let sensitiveData: { [key: string]: any } = {};
        let startAt: Date | null = null;
        let endAt: Date | null = null;
        let workflow: any = null;
        if (data.sensitiveData) {
            data.sensitiveData.forEach((item: { key: string, value: string }) => {
                sensitiveData[item.key] = item.value;
            });
        }

        if (data.isEditMode) {

            workflow = await this.workflowRepository.findById(data.workflowId);
            if (!workflow) {
                throw new NotFoundException("Workflow not found");
            }

            let sensitiveDataFromWorkflow: { [key: string]: any } = workflow.sensitiveData || {};
            if (sensitiveDataFromWorkflow) {
                Object.keys(sensitiveDataFromWorkflow).forEach((key) => {
                    sensitiveDataFromWorkflow[key] = this.encrypter.decrypt(sensitiveDataFromWorkflow[key]);
                })
            }

            sensitiveData = {
                ...sensitiveData,
                ...sensitiveDataFromWorkflow,
            }
        }

        const workflowToRun = {
            nodes: data.nodes,
            contextVariables: data.contextVariables || [],
            sensitiveData: sensitiveData,
            triggerEvent: "",
            steps: {},
        };

        try {
            startAt = new Date();

            const register = await this.customNodeRepository.findAllEnabled();
            const packagesName = register.map((item) => item.package_name);
            const customNodeManager = new CustomNodeManager(packagesName, new PackageUtil());
            const w = new WorkflowEngine(customNodeManager);

            // @ts-ignore
            await w.process(workflowToRun, {
                body: data.body || {},
                querystring: data.query || {},
                params: data.params || {},
                header: data.headers || {},
            })
            endAt = new Date();
            const state = w.getState();
            const logs = this.workflowUtil.getLogs(state.steps)

            if (workflow) {
                await this.workflowRepository.insertExecutionLog({
                    logs: logs,
                    workflowId: workflow.id,
                    startAt: startAt,
                    endAt: endAt,
                } as WorkflowExecutionModel);
            }

            return logs;
        } catch (error: any) {
            console.error(error);
            const errorLog = [
                {
                    output: {
                        type: "error",
                        message: error.message,
                        stack: error.stack,
                    },
                }
            ]

            if (workflow) {
                await this.workflowRepository.insertExecutionLog({
                    logs: errorLog,
                    workflowId: workflow.id,
                    startAt: startAt,
                    endAt: new Date(),
                } as WorkflowExecutionModel);
            }
            return errorLog;
        }
    }

    async trigger(data: {
        workflowId: string,
        body: any,
        query: any,
        params: any,
        headers: any,
    }): Promise<void> {
        const result = await this.workflowRepository.findById(data.workflowId);
        if (!result) {
            throw new NotFoundException("Workflow not found");
        }

        let sensitiveData: { [key: string]: any } = result.sensitiveData || {};
        if (sensitiveData) {
            const encrypter = new Encrypter();
            Object.keys(sensitiveData).forEach((key) => {
                sensitiveData[key] = encrypter.decrypt(sensitiveData[key]);
            })
        }

        await this.runWorkflow({
            sensitiveData: [],
            isEditMode: true,
            workflowId: result.id,
            nodes: result.nodes,
            contextVariables: result.contextVariables,
            body: data.body,
            query: data.query,
            params: data.params,
            headers: data.headers,
        })

        return;

    }

    async triggerByWebhook(data: {
        webhookId: string,
        body: any,
        query: any,
        params: any,
        headers: any,
    }): Promise<void> {
        const result = await this.workflowRepository.findByWebhookId(data.webhookId);
        if (!result) {
            throw new NotFoundException("Webhook not found");
        }

        await this.trigger({
            workflowId: result.id,
            body: data.body,
            query: data.query,
            params: data.params,
            headers: data.headers,
        })
    }

    async deleteOne(id: string) {
        await this.workflowRepository.deleteOne(id);
    }

    async getExecutionLogs(workflowId: string): Promise<Array<WorkflowExecutionModel>> {
        const results = await this.workflowRepository.getExecutionLogs(workflowId);
        return results || [];
    }

    async getById(id: string): Promise<any> {
        const result = await this.workflowRepository.findById(id);
        if (!result) {
            throw new NotFoundException("Workflow not found");
        }

        const sensitiveData: { [key: string]: any } = result.sensitiveData || {};
        if (sensitiveData) {
            Object.keys(sensitiveData).forEach((key) => {
                sensitiveData[key] = PREFIX_IDENTIFY_ENCRYPTED_KEY + sensitiveData[key];
            })
        }

        result.sensitiveData = Object.keys(sensitiveData).map((key) => {
            return {
                id: randomUUID(),
                key: key,
                value: sensitiveData[key],
            }
        });

        return result;
    }

    async create(data: {
        name: string;
        nodes: Array<any>;
        originalWorkflow: {
            nodes: Array<any>;
            edges: Array<any>;
        };
        sensitiveData: Array<{ key: string, value: string }>;
        webhookId: string;
    }) {
        const name = data.name;
        const workflowByName = await this.workflowRepository.findByName(name);
        if (workflowByName) {
            throw new BusinessException("Workflow already exists");
        }

        let sensitiveData: Array<{ key: string, value: string }> = data.sensitiveData;
        let sensitiveObject: { [key: string]: any } = {};
        if (sensitiveData && sensitiveData.length > 0) {
            sensitiveData.forEach((item) => {
                sensitiveObject[item.key] = this.encrypter.encrypt(item.value);
            })
        } else {
            sensitiveObject = {};
        }

        const firstNode = data.nodes[0];
        if (firstNode.type === "webhook") {
            data.webhookId = randomUUID();
        }

        const result = await this.workflowRepository.insertOne({
            name: data.name,
            data: {
                ...data,
                sensitiveData: sensitiveObject,
            },
            webhookId: data.webhookId,
            created_at: new Date(),
            updated_at: new Date(),
        });

        return result;
    }

    async update(data: {
        id: string;
        name: string;
        nodes: Array<any>;
        originalWorkflow: {
            nodes: Array<any>;
            edges: Array<any>;
        };
        sensitiveData: Array<{ key: string, value: string }>;
        webhookId: string;
    }) {
        const result = await this.workflowRepository.findById(data.id);
        if (!result) {
            throw new NotFoundException("Workflow not found");
        }

        let sensitiveData: Array<{ key: string, value: string }> = data.sensitiveData;
        let sensitiveObject: { [key: string]: any } = {};
        if (sensitiveData && sensitiveData.length > 0) {
            sensitiveData.forEach((item) => {
                if (!item.value.startsWith(PREFIX_IDENTIFY_ENCRYPTED_KEY)) {
                    sensitiveObject[item.key] = this.encrypter.encrypt(item.value);
                }
            })
        }

        const sensitiveDataFromWorkflow: { [key: string]: any } = result.sensitiveData || {};
        sensitiveObject = {
            ...sensitiveObject,
            ...sensitiveDataFromWorkflow,
        }

        await this.workflowRepository.updateOne(data.id, {
            name: data.name,
            data: {
                ...data,
                sensitiveData: sensitiveObject,
            },
            webhookId: data.webhookId,
            created_at: new Date(),
            updated_at: new Date(),
        });

        return result;

    }
}

export default WorkflowService;
