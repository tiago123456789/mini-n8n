
interface WorkflowExecutionModel {
    id: string;
    logs: Array<{ step: string, output: any, input: any }>;
    workflowId: string;
    startAt: Date;
    endAt: Date;
}

export default WorkflowExecutionModel