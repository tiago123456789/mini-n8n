const { LinkedList } = require("./LinkedList");
const CodeNode = require("./nodes/CodeNode");
const ConditionNode = require("./nodes/ConditionNode");
const HttpRequestNode = require("./nodes/HttpRequestNode");
const ManualTriggerNode = require("./nodes/ManualTriggerNode");
const WebhookNode = require("./nodes/WebhookNode");

module.exports = class WorkflowEngine {
  constructor() {
    this.state;
  }

  _getWorkflowAsLinkedList(workflow) {
    const wLinkedList = new LinkedList();
    for (let index = 0; index < workflow.nodes.length; index += 1) {
      const item = workflow.nodes[index];
      if (item.type == "condition") {
        const lSuccess = new LinkedList();
        item.setting.success.forEach((item) => lSuccess.add(item));
        item.setting.success = lSuccess;

        const lFail = new LinkedList();
        item.setting.fail.forEach((item) => lFail.add(item));
        item.setting.fail = lFail;

        wLinkedList.add(item);
      } else {
        wLinkedList.add(item);
      }
    }

    return wLinkedList;
  }

  _getWorkflowContextVariables(workflow) {
    const contextVariables = {};
    for (let index = 0; index < workflow.contextVariables.length; index += 1) {
      const item = workflow.contextVariables[index];
      contextVariables[item.key] = item.value;
    }

    return contextVariables;
  }

  async process(workflowToProcess, requestData) {
    this.state = workflowToProcess;
    this.state.nodes = this._getWorkflowAsLinkedList(workflowToProcess);
    this.state.context = this._getWorkflowContextVariables(workflowToProcess);
    if (this.state.triggerEvent == "webhook") {
      this.state.request = requestData;
    }

    const nodeByType = {
      webhook: (state) => new WebhookNode(state),
      api: (state) => new HttpRequestNode(state),
      manual: (state) => new ManualTriggerNode(state),
      condition: (state) => new ConditionNode(state),
      code: (state) => new CodeNode(state),
    };

    let start = this.state.nodes.head;
    let index = 0;
    while (start != null) {
      const nodeDataToProcess = start.value;
      nodeDataToProcess.input = this.state.request;
      const instance = nodeByType[nodeDataToProcess.type](this.state);
      const output = await instance.execute(nodeDataToProcess);

      if (nodeDataToProcess.type == "condition") {
        start = output.head;
        this.state.steps[nodeDataToProcess.name] = nodeDataToProcess;
        index += 1;
        continue;
      }

      nodeDataToProcess.output = output;
      this.state.steps[nodeDataToProcess.name] = nodeDataToProcess;
      start = start.next;
      index += 1;
    }
  }
};
