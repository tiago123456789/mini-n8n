import { Node, LinkedList, NodeBase, NodeInput, NodeReturn } from "core-package-mini-n8n";
import CustomNodeManager from "../utils/custom-node-manager.util";

import CodeNode from "./nodes/CodeNode";
import ConditionNode from "./nodes/ConditionNode";
import HttpRequestNode from "./nodes/HttpRequestNode";
import LoopNode from "./nodes/LoopNode";
import ManualTriggerNode from "./nodes/ManualTriggerNode";
import WebhookNode from "./nodes/WebhookNode";


class WorkflowEngine {

  private state: any;
  private customNodeManager: CustomNodeManager;

  constructor(
    customNodeManager: CustomNodeManager
  ) {
    this.state;
    this.customNodeManager = customNodeManager;
  }

  getState() {
    return this.state;
  }

  private getWorkflowAsLinkedList(workflow: { nodes: Array<{ [key: string]: any }> }): LinkedList {
    const wLinkedList = new LinkedList();
    if (workflow.nodes instanceof LinkedList) {
      return workflow.nodes;
    }

    for (let index = 0; index < workflow.nodes.length; index += 1) {
      const item = workflow.nodes[index];
      if (item?.type == "condition") {
        const lSuccess = new LinkedList();
        item.setting.success.forEach((item: NodeBase) => lSuccess.add(item));
        item.setting.success = lSuccess;

        const lFail = new LinkedList();
        item.setting.fail.forEach((item: NodeBase) => lFail.add(item));
        item.setting.fail = lFail;

        wLinkedList.add(item as NodeBase);
      } else if (item?.type == "loop") {
        const lNodes = new LinkedList();
        item.setting.nodes.forEach((item: NodeBase) => lNodes.add(item));
        item.setting.nodes = lNodes;

        wLinkedList.add(item as NodeBase);
      } else {
        wLinkedList.add(item as NodeBase);
      }
    }

    return wLinkedList;
  }

  private getWorkflowContextVariables(workflow: { contextVariables: Array<{ [key: string]: any }> }) {
    const contextVariables: { [key: string]: any } = {};
    for (let index = 0; index < workflow.contextVariables.length; index += 1) {
      const item = workflow.contextVariables[index];
      contextVariables[item?.key] = item?.value;
    }

    return contextVariables;
  }

  async process(workflowToProcess: {
    nodes: Array<{ [key: string]: any }>,
    contextVariables: Array<{ [key: string]: any }>,
    sensitiveData: Array<{ [key: string]: any }>,
    triggerEvent: string,
    steps: { [key: string]: any },
  }, requestData: any) {
    this.state = workflowToProcess;
    this.state.nodes = this.getWorkflowAsLinkedList(workflowToProcess);
    this.state.context = this.getWorkflowContextVariables(workflowToProcess);
    this.state.sensitiveData = workflowToProcess.sensitiveData;
    this.state.request = requestData;
    this.state.steps = {...this.state.steps, ...workflowToProcess.steps};
     
    const instanceByType: { [key: string]: (state: any) => NodeBase } = {
      webhook: (state: any) => new WebhookNode(state),
      api: (state: any) => new HttpRequestNode(state),
      manual: (state: any) => new ManualTriggerNode(state),
      condition: (state: any) => new ConditionNode(state),
      code: (state: any) => new CodeNode(state),
      loop: (state: any) => new LoopNode(
        state,
        new WorkflowEngine(this.customNodeManager)
      ),
    };

    let start: { [key: string]: any } | LinkedList | null = this.state.nodes.head;
    while (start != null) {
      // @ts-ignore
      const item: { type: string, name: string, [key: string]: any } = start?.value;
      let instance: NodeBase | undefined;
      let name: string | undefined = item.name;


      if (!instanceByType[item.type]) {
        instance = await this.customNodeManager.getCustomNodeByType(item.type, this.state)
      } else {
        // @ts-ignore
        instance = instanceByType[item.type](this.state);
      }

      const output: NodeReturn | LinkedList = await instance.execute({
        ...item,
        settings: item.setting || {},
        steps: this.state.steps,
      });

      if (output instanceof LinkedList) {
        // @ts-ignore
        start = output.head;
        this.state.steps[name || "default"] = {
          output: {},
          input: this.state.request || {}, 
        }
        continue;
      }

      this.state.steps[name || "default"] = {
        output,
        input: this.state.request || {},
      }
      // @ts-ignore
      start = start.next;
    }
  }
};


export default WorkflowEngine