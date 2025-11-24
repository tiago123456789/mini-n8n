import LogEntry from "./log-entry";

interface Execution {
    _id: string;
    logs: LogEntry[];
    workflowId: string;
    startAt: string;
    endAt?: string;
    __v: number;
  }

  export default Execution