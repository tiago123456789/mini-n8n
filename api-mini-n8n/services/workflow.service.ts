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
        if (data.sensitiveData) {
            data.sensitiveData.forEach((item: { key: string, value: string }) => {
                sensitiveData[item.key] = item.value;
            });
        }

        let workflow = null;
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
            const startAt = new Date();

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
            const endAt = new Date();
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
            throw error;
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
}

export default WorkflowService;
