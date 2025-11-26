import db from "../config/db";
import WorkflowExecutionModel from "../models/workflow-execution.model";
import WorkflowModel from "../models/workflow.model";

class WorkflowRepository {
    
    deleteOne(id: string): Promise<any> {
        return db("workflows").where("id", id).del();
    }
    async insertOne(data: { [key: string]: any }): Promise<any> {
        const result = await db("workflows").insert(data).returning("*");
        return result[0];
    }

    updateOne(id: string, data: { [key: string]: any }): Promise<any> {
        return db("workflows").where("id", id).update(data);
    }

    async findByName(name: string): Promise<WorkflowModel | null> {
        const registers = await db("workflows").select("*").where("name", name);
        if (!registers[0]) {
            return null;
        }

        return {
            id: registers[0].id,
            name: registers[0].name,
            nodes: registers[0].data.nodes,
            originalWorkflow: registers[0].data.originalWorkflow,
            sensitiveData: registers[0].data.sensitiveData,
            contextVariables: registers[0].data.contextVariables,
            triggerEvent: registers[0].data.triggerEvent,
            webhookId: registers[0].data.webhookId,
            created_at: registers[0].created_at,
            updated_at: registers[0].updated_at,
        }
    }

    async findAll(): Promise<WorkflowModel[] | null> {
        const registers = await db("workflows").select("*");
        if (!registers[0]) {
            return null;
        }

        return registers.map((register) => {
            return {
                id: register.id,
                name: register.name,
                nodes: register.data.nodes,
                originalWorkflow: register.data.originalWorkflow,
                sensitiveData: register.data.sensitiveData,
                contextVariables: register.data.contextVariables,
                triggerEvent: register.data.triggerEvent,
                webhookId: register.webhookId,
                created_at: register.created_at,
                updated_at: register.updated_at,
            }
        })
    }

    async findByWebhookId(webhookId: string): Promise<WorkflowModel | null> {
        const registers = await db("workflows").select("*").where("webhookId", webhookId);
        if (!registers[0]) {
            return null;
        }

        registers[0].data = JSON.parse(registers[0].data);

        return {
            id: registers[0].id,
            name: registers[0].name,
            nodes: registers[0].data.nodes,
            originalWorkflow: registers[0].data.originalWorkflow,
            sensitiveData: registers[0].data.sensitiveData,
            contextVariables: registers[0].data.contextVariables,
            triggerEvent: registers[0].data.triggerEvent,
            webhookId: registers[0].data.webhookId,
            created_at: registers[0].created_at,
            updated_at: registers[0].updated_at,
        }
    }
    async findById(id: string): Promise<WorkflowModel | null> {
        const registers = await db("workflows").select("*").where("id", id);
        if (!registers[0]) {
            return null;
        }

        registers[0].data = JSON.parse(registers[0].data);

        return {
            id: registers[0].id,
            name: registers[0].name,
            nodes: registers[0].data.nodes,
            originalWorkflow: registers[0].data.originalWorkflow,
            sensitiveData: registers[0].data.sensitiveData,
            contextVariables: registers[0].data.contextVariables,
            triggerEvent: registers[0].data.triggerEvent,
            webhookId: registers[0].data.webhookId,
            created_at: registers[0].created_at,
            updated_at: registers[0].updated_at,
        }
    }

    async getExecutionLogs(workflowId: string): Promise<WorkflowExecutionModel[]> {
        const registers = await db("workflow_executions")
            .select("*")
            .where("workflowId", workflowId)
            .orderBy("id", "desc")
            .limit(10);
        
        return registers.map((item: any) => {
            return {
                id: item.id,
                logs: JSON.parse(item.logs),
                workflowId: item.workflowId,
                startAt: item.startAt,
                endAt: item.endAt,
            }
        })
    }

    async insertExecutionLog(logs: WorkflowExecutionModel) {
        return db("workflow_executions").insert({
            ...logs,
            logs: JSON.stringify(logs.logs),
        });
    }
}

export default WorkflowRepository