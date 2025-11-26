
interface Workflow {
    id: string;
    triggerEvent: string;
    created_at: string;
    name: string;
    webhookId?: string;
};

export default Workflow;
