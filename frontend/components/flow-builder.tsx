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
} from "reactflow";
import "reactflow/dist/style.css";
import { ToastContainer, toast } from "react-toastify";

import { WebhookNode } from "./nodes/webhook-node";
import { ApiNode } from "./nodes/api-node";
import { ConditionNode } from "./nodes/condition-node";
import NodeConfigPanel from "./node-config-panel";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Target } from "lucide-react";
import { z } from "zod";
import { CodeNode } from "./nodes/code-node";
import axios from "axios";
import { ContextVariable } from "./context-modal";
import { FlowSidebar } from "./flow-sidebar";

const nodeTypes: NodeTypes = {
  webhook: WebhookNode,
  api: ApiNode,
  condition: ConditionNode,
  code: CodeNode,
};

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
    params: z.string(),
  }),
};

const defaultDataByNodeTypes: { [key: string]: any } = {
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
    code: "function node(data) { console.log(data) }",
    params: '{ "message": "Hi my friend"}',
  },
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
  {
    id: "2",
    type: "api",
    position: { x: 250, y: 250 },
    data: {
      label: "API",
      name: "trigger_api_2",
      endpoint: "https://webhook.site/18eb8dca-7fba-4512-bf61-21392e905b60",
      method: "GET",
      headers: [{ key: "apiKey", value: "abaaafldjfasdfa", type: "raw" }],
      body: [{ key: "message", value: "Hi my friend", type: "raw" }],
    },
  },
  {
    id: "3",
    type: "condition",
    position: { x: 250, y: 400 },
    data: {
      label: "Condition",
      name: "trigger_condition_3",
      condition: {
        left: "1",
        operator: "==",
        right: "1",
      },
      trueLabel: "True",
      falseLabel: "False",
    },
  },
];

const initialEdges: Array<{ [key: string]: any }> = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];


interface FlowBuilderProps {
  flowName?: string
  onFlowNameChange?: (name: string) => void
  workflowToEdit: any,
  contextVariables?: ContextVariable[]
}

export default function FlowBuilder({ 
  workflowToEdit, 
  flowName, 
  contextVariables 
}: FlowBuilderProps) {
  const reactFlowWrapper = useRef(null);
  const [workflowId, setWorkflowId] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    // @ts-ignore
    useEdgesState<Array<{ [key: string]: any }>>(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = (params: Connection | Edge) => {
    const mapNodesById: { [key: string]: any } = {
      // id: node
    };

    for (let index = 0; index < nodes.length; index += 1) {
      const item = nodes[index];
      mapNodesById[item.id] = item;
    }

    // @ts-ignore
    const nodeByType = mapNodesById[params?.source];
    const isSourceConditionNode = nodeByType && nodeByType.type == "condition";
    console.log("########################");
    console.log("########################");
    console.log(isSourceConditionNode, nodeByType, nodeByType?.type);
    if (isSourceConditionNode) {
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

    console.log("####################");
    console.log(edges);
    setEdges((eds) => addEdge(params, eds));
  };

  const onNodeClick = (_, node) => {
    setSelectedNode({ ...node });
  };

  const onNodeConfigChange = (nodeId, newData) => {
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

  const addNode = (type) => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const newNode = {
      id: `${nodes.length + 1}`,
      type,
      position: {
        x: 250,
        y: nodes.length > 0 ? nodes[nodes.length - 1].position.y + 150 : 100,
      },
      data: {
        ...defaultDataByNodeTypes[type],
        label: typeLabel,
        name: `trigger_${typeLabel}_${nodes.length + 1}`.toLowerCase(),
      },
    };

    setNodes((nds) => [...nds, { ...newNode }]);
  };

  const closeConfigPanel = () => {
    setSelectedNode(null);
  };

  const deleteNode = useCallback(
    (nodeId) => {
      if (nodes.length == 1) {
        return;
      }

      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [selectedNode, setNodes, setEdges]
  );

  const parseToSave = (
    item: { [key: string]: any },
    mapNodesById: { [key: string]: any },
    ignoreNodeById: string[]
  ) => {
    if (item.type == "webhook") {
      return {
        type: item.type,
        name: item.data.name,
        input: {},
        output: {},
      };
    } else if (item.type == "code") {
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
    } else if (item.type == "api") {
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
    } else if (item.type == "condition") {
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
        .filter((option) => {
          return (
            // @ts-ignore
            option.parentId == item.id && option.pathCondition == "true"
          );
        })
        .map((option) => {
          const node = mapNodesById[option.target];
          ignoreNodeById[node.id] = true;
          return parseToSave(node, mapNodesById, ignoreNodeById);
        });

      // @ts-ignore
      itemToAdd.setting.fail = edges
        .filter((option) => {
          return (
            // @ts-ignore
            option.parentId == item.id && option.pathCondition == "false"
          );
        })
        .map((option) => {
          const node = mapNodesById[option.target];
          ignoreNodeById[node.id] = true;
          return parseToSave(node, mapNodesById, ignoreNodeById);
        });

      return itemToAdd;
    }
  };

  const saveWorkflow = async () => {
    const triggerEvent = nodes[0].type;
    const workflow: { [key: string]: any } = {
      triggerEvent,
      nodes: [],
    };

    const mapNodesById: { [key: string]: any } = {
      // id: node
    };

    for (let index = 0; index < nodes.length; index += 1) {
      const item = nodes[index];
      // @ts-ignore
      const schemaValidation = validationDataNodeTypes[item.type] as z.Schema;
      const result = schemaValidation.safeParse(item.data);

      if (!result.success) {
        toast.error(
          // @ts-ignore
          `Você precisa preencher as informações do node ${item.data.name}`
        );
        console.error("❌ Validation errors:", result.error.errors);
        return;
      }

      mapNodesById[item.id] = item;
    }

    const ignoreNodeById: { [key: number]: boolean } = {};

    for (let index = 0; index < nodes.length; index += 1) {
      const item = nodes[index];
      // @ts-ignore
      if (ignoreNodeById[item.id]) {
        continue;
      }

      workflow.nodes.push(parseToSave(item, mapNodesById, ignoreNodeById));
    }

    if (workflowId) {
      await axios.put (`http://localhost:5000/${workflowId}`, {
        contextVariables: contextVariables,
        name: flowName,
        originalWorkflow: {
          nodes: nodes,
          edges: edges,
        },
        ...workflow
      });
      toast.success("Workflow atualizado com sucesso");
    } else {
      await axios.post("http://localhost:5000/", {
        contextVariables: contextVariables,
        name: flowName,
        originalWorkflow: {
          nodes: nodes,
          edges: edges,
        },
        ...workflow
      });

      toast.success("Workflow salvo com sucesso");
    }
    
  };

  useEffect(() => {
    if (workflowToEdit) {
      setNodes(workflowToEdit.originalWorkflow.nodes);
      setEdges(workflowToEdit.originalWorkflow.edges);
      setWorkflowId(workflowToEdit._id);
    }
  }, [workflowToEdit]);

  useEffect(() => {
    document.title = `${flowName} - Flow Builder`
  }, [flowName])


  return (
    <div className="flex h-full">
      <FlowSidebar onAddNode={addNode} />
      <ReactFlowProvider>
        <div ref={reactFlowWrapper} className="flex-1 h-[calc(100vh-4rem)]">
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                deleteNode: () => deleteNode(node.id),
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
      </ReactFlowProvider>
      <ToastContainer />
    </div>
  );
}
