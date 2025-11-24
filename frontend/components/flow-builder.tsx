"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  type Connection,
  type Edge,
  type NodeTypes,
  useStoreApi,
} from "reactflow";
import "reactflow/dist/style.css";
import { ToastContainer, toast } from "react-toastify";

import { WebhookNode } from "./nodes/webhook-node";
import { ApiNode } from "./nodes/api-node";
import { ConditionNode } from "./nodes/condition-node";
import { LoopNode } from "./nodes/loop-node";
import NodeConfigPanel from "./node-config-panel";
import { Button } from "@/components/ui/button";
import { GitBranch, PlusCircle, Save, Target, Shield, Play } from "lucide-react";
import { z } from "zod";
import { CodeNode } from "./nodes/code-node";
import axios, { AxiosError } from "axios";
import { SensitiveDataModal } from "./sensitive-data-modal";
import { LogsModal } from "./logs-modal";
import { FlowSidebar } from "./flow-sidebar";
import { CustomNode } from "./nodes/custom-node";
import ExecutionsDrawer from "./executions-drawer";
import { useRouter } from 'next/navigation';
import useWorkflow from "@/hooks/useWorkflow";
import SensitiveData from "@/types/sensitive-data";
import NativeNodeType from "@/types/native-node-type.type";


const validationDataNodeTypes: {
  [key: string]: z.ZodObject<{ [key: string]: any }>;
} = {
  api: z.object({
    endpoint: z.string().min(3),
    method: z.enum(["GET", "POST", "DELETE", "PUT"]),
  }),
  webhook: z.object({}),
  condition: z.object({
    condition: z.object({
      left: z.any(),
      operator: z.string(),
      right: z.any(),
    }),
  }),
  code: z.object({
    code: z.string(),
  }),
  loop: z.object({
    source: z.string(),
  }),
};



const initialNodes = [
  {
    id: "1",
    type: "webhook",
    position: { x: 250, y: 100 },
    data: {
      label: "Webhook",
      name: "trigger_webhook_1",
    },
  },
];

const initialEdges: Array<{ [key: string]: any }> = [
];


interface FlowBuilderProps {
  flowName?: string
  onFlowNameChange?: (name: string) => void
  workflowToEdit: any,
}

export default function FlowBuilder({
  workflowToEdit,
  flowName,
}: FlowBuilderProps) {
  const router = useRouter();
  const reactFlowWrapper = useRef(null);
  const [workflowId, setWorkflowId] = useState(null);
  const [defaultDataByNodeTypes, setDefaultDataByNodeTypes] = useState<{ [key: string]: any }>({
    api: {
      label: "API",
      name: "",
      endpoint: "https://webhook.site/18eb8dca-7fba-4512-bf61-21392e905b60",
      method: "GET",
      headers: null,
      body: null,
    },
    webhook: {
      label: "Webhook",
      name: "",
    },
    condition: {
      data: {
        label: "Condition",
        name: "",
        condition: {
          left: "1",
          operator: "==",
          right: "1",
        },
        trueLabel: "True",
        falseLabel: "False",
      },
    },
    code: {
      code: "function node() { console.log('Hello World') }",
    },
    loop: {
      label: "Loop",
      name: "",
      source: "",
    },
  })
  const [nodeTypes, setNodeTypes] = useState<NodeTypes>({
    webhook: WebhookNode,
    api: ApiNode,
    condition: ConditionNode,
    code: CodeNode,
    loop: LoopNode,
  });
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    // @ts-ignore
    useEdgesState<Array<{ [key: string]: any }>>(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [customNodes, setCustomNodes] = useState<any[]>([])
  const [sensitiveData, setSensitiveData] = useState<SensitiveData[]>([])
  const [isSensitiveDataModalOpen, setIsSensitiveDataModalOpen] = useState(false)

  const {
    updateWorkflow, runWorkflow,
    logs, isLogsModalOpen,
    setIsLogsModalOpen, isRunningWorkflow,
    getCustomNodes, createWorkflow
  } = useWorkflow();

  const onConnect = (params: Connection | Edge) => {
    const mapNodesById: { [key: string]: any } = {};

    for (let index = 0; index < nodes.length; index += 1) {
      const item = nodes[index];
      mapNodesById[item.id] = item;
    }

    // @ts-ignore
    const nodeByType = mapNodesById[params?.source];
    const isSourceConditionNode = nodeByType && nodeByType.type == "condition";
    const isSourceLoopNode = nodeByType && nodeByType.type == "loop";
    if (isSourceConditionNode || isSourceLoopNode) {
      // @ts-ignore
      params.parentId = params.source;
      // @ts-ignore
      params.pathCondition = params.sourceHandle;
    } else {
      const sourceEdge = edges.filter((edge) => edge.target == params.source);
      //@ts-ignore
      if (sourceEdge[0] && sourceEdge[0].parentId) {
        // @ts-ignore
        params.parentId = sourceEdge[0].parentId;
        // @ts-ignore
        params.pathCondition = sourceEdge[0].pathCondition;
      }
    }

    setEdges((eds) => addEdge(params, eds));
  };

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode({ ...node });
  };

  const onNodeConfigChange = (nodeId: string, newData: any) => {
    setNodes((nds) => [
      ...nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      }),
    ]);
  };

  const addNode = (type: string) => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const data = {
      ...defaultDataByNodeTypes[type],
      label: type.charAt(0).toUpperCase() + type.slice(1),
      name: `trigger_${typeLabel}_${nodes.length + 1}`.toLowerCase(),
    }

    const newNode = {
      id: `${nodes.length + 1}`,
      type,
      position: {
        x: 250,
        y: nodes.length > 0 ? nodes[nodes.length - 1].position.y + 150 : 100,
      },
      data,
    };

    setNodes((nds) => [...nds, { ...newNode }]);
  };

  const closeConfigPanel = () => {
    setSelectedNode(null);
  };

  const duplicateNode =
    (nodeId: string) => {
      const node = nodes.find((node) => node.id === nodeId);
      if (!node) {
        return;
      }

      // @ts-ignore
      const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);
      const newNode = {
        id: `${nodes.length + 2}`,
        type: node.type,
        position: {
          x: 250,
          y: nodes.length > 0 ? nodes[nodes.length - 1].position.y + 150 : 100,
        },
        data: { ...node.data },
      };

      // @ts-ignore
      newNode.data.label = node.type.charAt(0).toUpperCase() + node.type.slice(1);
      newNode.data.name = `trigger_${typeLabel}_${nodes.length + 1}`.toLowerCase();
      setNodes((nds) => [...nds, { ...newNode }]);
    }

  const deleteNode = useCallback(
    (nodeId: string) => {

      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      // @ts-ignore
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [selectedNode, setNodes, setEdges]
  );

  const parseToSave = (
    item: { [key: string]: any },
    mapNodesById: { [key: string]: any },
    ignoreNodeById: { [key: string]: any },
    index: number
  ) => {
    if (item.type == NativeNodeType.webhook) {
      return {
        type: item.type,
        name: item.data.name,
        input: {},
        output: {},
      };
    } else if (item.type == NativeNodeType.code) {
      return {
        type: item.type,
        name: item.data.name,
        setting: {
          code: btoa(unescape(encodeURIComponent(item.data.code))),
          params: item.data.params,
        },
        input: {},
        output: {},
      };
    } else if (item.type == NativeNodeType.api) {
      return {
        type: item.type,
        name: item.data.name,
        setting: {
          method: item.data.method,
          url: item.data.endpoint,
          headers: item.data.headers,
          body: item.data.body,
        },
        input: {},
        output: {},
      };
    } else if (item.type == NativeNodeType.condition) {
      // @ts-ignore
      const left = item?.data?.condition?.left;
      const leftType = left.startsWith("this.state") ? "expression" : "raw";
      // @ts-ignore
      const right = item?.data?.condition?.right;
      const rightType = right.startsWith("this.state") ? "expression" : "raw";

      // @ts-ignore
      const operator = item?.data?.condition?.operator;

      const itemToAdd = {
        type: item.type,
        name: item.data.name,
        setting: {
          condition: {
            left: {
              type: leftType,
              value: left,
            },
            right: {
              type: rightType,
              value: right,
            },
            operator: operator,
          },
          success: [],
          fail: [],
        },
        input: {},
        output: {},
      };

      // @ts-ignore
      itemToAdd.setting.success = edges
        .filter((option: { [key: string]: any }) => {
          return (
            // @ts-ignore
            option.parentId == item.id && option.pathCondition == "true"
          );
        })
        .map((option: { [key: string]: any }) => {
          const node = mapNodesById[option.target];
          ignoreNodeById[node.id] = true;
          return parseToSave(node, mapNodesById, ignoreNodeById, index);
        });

      // @ts-ignore
      itemToAdd.setting.fail = edges
        .filter((option: { [key: string]: any }) => {
          return (
            // @ts-ignore
            option.parentId == item.id && option.pathCondition == "false"
          );
        })
        .map((option: { [key: string]: any }) => {
          const node = mapNodesById[option.target];
          ignoreNodeById[node.id] = true;
          return parseToSave(node, mapNodesById, ignoreNodeById, index);
        });

      return itemToAdd;
    } else if (item.type == NativeNodeType.loop) {
      const itemToAdd = {
        type: item.type,
        name: item.data.name,
        setting: {
          source: item.data.source || [],
          nodes: [],
        },
        input: {},
        output: {},
      };

      // @ts-ignore
      itemToAdd.setting.nodes = edges
        .filter((option: { [key: string]: any }) => {
          return (
            // @ts-ignore
            option.parentId == item.id && option.pathCondition == "loop"
          );
        })
        .map((option: { [key: string]: any }, index: number) => {
          const node = mapNodesById[option.target];
          ignoreNodeById[node.id] = true;
          return parseToSave(node, mapNodesById, ignoreNodeById, index);
        });

      return itemToAdd;
    }

    const itemData = item.data;
    delete itemData.isCustomNode;
    delete itemData.name;


    const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
    item.data.name = `trigger_${typeLabel}_${index + 1}`.toLowerCase()

    return {
      type: item.type,
      name: item.data.name,
      setting: itemData,
      input: {},
      output: {},
    }
  };

  const saveWorkflow = async (isTest: boolean = false) => {
    if (nodes.length == 0) {
      toast.error("You need at least one node to start the Worflow");
      return;
    }

    const triggerEvent = nodes[0].type;
    const workflow: { [key: string]: any } = {
      triggerEvent,
      nodes: [],
    };
   
    const mapNodesById: { [key: string]: any } = {};
    const nodesToProcess = [...nodes]
    for (let index = 0; index < nodesToProcess.length; index += 1) {
      const item = nodesToProcess[index];
      // @ts-ignore

      const isCustomNode = !validationDataNodeTypes[item.type];
      if (isCustomNode) {
        const schema = {}

        // @ts-ignore
        item.data.properties.filter(property => property.required).forEach((property: { [key: string]: any }) => {
          if (property.name) {
            if (property.required) {
              // @ts-ignore
              schema[property.name] = z.string();
            } else {
              // @ts-ignore
              schema[property.name] = z.string().optional();
            }
          }
        });

        const schemaValidation = z.object(schema);
        const result = schemaValidation.safeParse(item.data);
        if (!result.success) {
          toast.error(
            `You need to fill the information of the node ${item.data.name}`
          );
          return;
        }
      } else {
        // @ts-ignore
        const schemaValidation = validationDataNodeTypes[item.type] as z.Schema;
        const result = schemaValidation.safeParse(item.data);

        if (!result.success) {
          toast.error(
            // @ts-ignore
            `You need to fill the information of the node ${item.data.name}`
          );
          return;
        }
      }

      mapNodesById[item.id] = item;
    }

    const ignoreNodeById: { [key: string]: boolean } = {};
    for (let index = 0; index < nodesToProcess.length; index += 1) {
      const item = nodesToProcess[index];
      if (ignoreNodeById[item.id]) {
        continue;
      }

      workflow.nodes.push(
        parseToSave(
          item,
          mapNodesById,
          ignoreNodeById,
          index
        )
      );
    }

    if (isTest) {
      runWorkflow({
        isEditMode: workflowToEdit != null,
        workflowId: workflowToEdit?.id,
        contextVariables: [],
        sensitiveData: [...sensitiveData],
        name: flowName || "",
        originalWorkflow: {
          nodes: [...nodes],
          edges: [...edges],
        },
        ...workflow
      });
      return;
    }

    if (workflowId) {
      await updateWorkflow({
        workflowId: workflowId,
        contextVariables: [],
        name: flowName || "",
        sensitiveData: [...sensitiveData],
        originalWorkflow: {
          nodes: [...nodes],
          edges: [...edges],
        },
        ...workflow
      });
    } else {
      const workflowCreated = await createWorkflow({
        contextVariables: [],
        sensitiveData: [...sensitiveData],
        name: flowName || "",
        originalWorkflow: {
          nodes: [...nodes],
          edges: [...edges],
        },
        nodes: [...workflow.nodes],
      });

      setTimeout(() => {
        router.push(`/workflows/${workflowCreated.id}/edit`);
      }, 1000);
    }

  };

  const loadCustomNodes = async () => {
    const customNodes = await getCustomNodes();
    const items: any[] = [];
    const itemsTypes: any = {};
    const defaultDataByNodeTypesToCustomNodes: { [key: string]: any } = {};
    customNodes.forEach((node: any) => {
      itemsTypes[node.name] = CustomNode;
      const defaultData: { [key: string]: any } = {}
      node.properties.forEach((prop: any) => {
        defaultData[prop.name] = prop.default
      });

      defaultDataByNodeTypesToCustomNodes[node.name] = {
        ...defaultData,
        properties: node.properties,
        isCustomNode: node.isCustomNode
      };

      items.push({
        type: node.name,
        label: node.name,
        icon: GitBranch,
        description: node.description,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      });
    })
    setCustomNodes(items);
    setNodeTypes({ ...nodeTypes, ...itemsTypes });
    setDefaultDataByNodeTypes({
      ...defaultDataByNodeTypes,
      ...defaultDataByNodeTypesToCustomNodes
    });
  }

  useEffect(() => {
    if (workflowToEdit) {
      loadCustomNodes().then(() => {
        workflowToEdit.originalWorkflow.nodes = workflowToEdit.originalWorkflow.nodes.map((node: any, index: number) => {
          const type = node.type
          const nodeDefaultData = defaultDataByNodeTypes[type]
          node.data.isCustomNode = nodeDefaultData.isCustomNode || false
          const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
          node.data.name = `trigger_${typeLabel}_${index + 1}`.toLowerCase()
          return node;
        })
        setNodes(workflowToEdit.originalWorkflow.nodes);
        setEdges(workflowToEdit.originalWorkflow.edges);
        setWorkflowId(workflowToEdit.id);
        setSensitiveData([...workflowToEdit.sensitiveData]);
      });
    }
  }, [workflowToEdit]);

  useEffect(() => {
    document.title = `${flowName} - Flow Builder`

  }, [flowName])

  useEffect(() => {
    if (!workflowToEdit) {
      loadCustomNodes();
    }
  }, [])


  return (
    <div className="flex h-full">
      <FlowSidebar onAddNode={addNode} customNodes={customNodes} />
      <ReactFlowProvider>
        <div ref={reactFlowWrapper} className="flex-1 h-[calc(100vh-4rem)]">
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                deleteNode: () => deleteNode(node.id),
                duplicateNode: () => duplicateNode(node.id),
              },
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background />
            <Panel position="top-right" className="flex gap-2">
              <ExecutionsDrawer workflowId={workflowToEdit?.id} />
              <Button size="sm" variant="outline" onClick={() => saveWorkflow(true)}>
                <Play className="mr-2 h-4 w-4" />
                Run Workflow
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsSensitiveDataModalOpen(true)}>
                <Shield className="mr-2 h-4 w-4" />
                Sensitive Data
              </Button>
              <Button size="sm" onClick={() => saveWorkflow()}>
                <Save className="mr-2 h-4 w-4" />
                Save Workflow
              </Button>
            </Panel>
          </ReactFlow>
        </div>
        {selectedNode && (
          <>
            <NodeConfigPanel
              node={selectedNode}
              onChange={onNodeConfigChange}
              onClose={closeConfigPanel}
            />
          </>
        )}
        <SensitiveDataModal
          isOpen={isSensitiveDataModalOpen}
          onClose={() => setIsSensitiveDataModalOpen(false)}
          sensitiveData={sensitiveData}
          onSave={setSensitiveData}
        />
        <LogsModal
          isOpen={isLogsModalOpen}
          onClose={() => setIsLogsModalOpen(false)}
          logs={logs}
          isLoading={isRunningWorkflow}
        />
      </ReactFlowProvider>
      <ToastContainer />
    </div>
  );
}
