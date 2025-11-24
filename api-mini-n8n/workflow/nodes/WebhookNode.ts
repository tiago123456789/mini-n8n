import { LinkedList, NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n";

export default class WebhookNode extends NodeBase {
  constructor(state: any) {
    super(state);
  }

  getConfig(): NodeConfig {
    return {
      name: "Webhook",
      type: "webhook",
      description: "Webhook node",
      properties: [],
    }
  }

  execute(node: NodeInput): Promise<NodeReturn | LinkedList> {
    return Promise.resolve({});
  }
};
