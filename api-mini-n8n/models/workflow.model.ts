
interface WorkflowModel {
    id: string;
    name: string;
    nodes: Array<{[key: string]: any}>,
    originalWorkflow: Array<{[key: string]: any}>,
    sensitiveData: Array<{[key: string]: any}>
    contextVariables: Array<{[key: string]: any}>
    triggerEvent: string
    webhookId?: string;
    created_at: Date;
    updated_at: Date;
}

export default WorkflowModel