import { useState } from "react";
import Workflow from "../types/workflow";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import LogEntry from "../types/log-entry";
import SensitiveData from "@/types/sensitive-data";
import Execution from "@/types/execution";

function useWorkflow() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getWorkflows = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/workflows`
      );
      setWorkflows(response.data.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch workflows");
    }
  };

  const triggerWorkflow = async (workflowId: string) => {
    await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/trigger`
    );
    toast.success("Workflow triggered successfully");
  };

  const deleteWorkflow = async (workflowId: string) => {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}`
    );
    getWorkflows();
  };

  const runWorkflow = async (data: {
    isEditMode: boolean;
    workflowId: string;
    contextVariables: [];
    sensitiveData: SensitiveData[];
    name: string;
    originalWorkflow: {
      nodes: any[];
      edges: any[];
    };
    [key: string]: any;
  }) => {
    setIsRunningWorkflow(true);
    setIsLogsModalOpen(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/run-workflows`,
        data
      );

      setLogs(response.data.logs);
      toast.success("Workflow executed successfully");
    } catch (error: any) {
      if (error.response instanceof AxiosError) {
        toast.error(error.response.data.error);
      }
      setLogs([]);
    } finally {
      setIsRunningWorkflow(false);
    }
  };

  const getWorkflowById = async (id: string) => {
    const workflow = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/workflows/${id}`
    );
    setWorkflow(workflow.data.data);
  };

  const updateWorkflow = async (data: {
    workflowId: string;
    contextVariables: [];
    sensitiveData: SensitiveData[];
    name: string;
    originalWorkflow: {
      nodes: any[];
      edges: any[];
    };
    [key: string]: any;
  }) => {
    await axios.put(`http://localhost:5000/workflows/${data.workflowId}`, data);
    toast.success("Workflow atualizado com sucesso");
  };

  const getCustomNodes = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/custom-nodes`
    );
    return response.data;
  };

  const createWorkflow = async (data: {
    contextVariables: [];
    sensitiveData: SensitiveData[];
    name: string;
    nodes: Array<any>;
    originalWorkflow: {
      nodes: any[];
      edges: any[];
    };
    [key: string]: any;
  }) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/workflows`,
      {
        contextVariables: [],
        name: data.name,
        nodes: data.nodes,
        originalWorkflow: data.originalWorkflow,
        sensitiveData: [...data.sensitiveData],
      }
    );
    toast.success("Workflow created successfully");
    return response.data;
  };

  const fetchExecutions = async (workflowId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/executions`
      );
      setExecutions(response.data);
    } catch (error) {
      toast.error("Failed to fetch executions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChatMessage = async (content: string, nodes: Array<any>) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/workflows-assistant`,
      {
        currentNodes: nodes || [],
        prompt: content,
      }
    );

    return response;
  };

  return {
    workflows,
    getWorkflows,
    triggerWorkflow,
    deleteWorkflow,
    getWorkflowById,
    workflow,
    runWorkflow,
    logs,
    isLogsModalOpen,
    setIsLogsModalOpen,
    isRunningWorkflow,
    updateWorkflow,
    getCustomNodes,
    createWorkflow,
    executions,
    isLoading,
    fetchExecutions,
    handleUserChatMessage,
  };
}

export default useWorkflow;
