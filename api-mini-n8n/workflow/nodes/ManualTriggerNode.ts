import { LinkedList, NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n";

export default class ManualTriggerNode extends NodeBase {
  constructor(state: any) {
    super(state);
  }

  getConfig(): NodeConfig {
    return {
      name: "Manual Trigger",
      type: "manual",
      description: "Manual trigger node",
      properties: [],
    }
  }

  execute(node: NodeInput): Promise<NodeReturn | LinkedList> {
    return Promise.resolve({});
  }
};
