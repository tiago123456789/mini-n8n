import { LinkedList, NodeBase, NodeInput, NodeReturn } from "core-package-mini-n8n";

import axios from "axios";

export default class HttpRequestNode extends NodeBase {
  constructor(state: any) {
    super(state);
  }

  getConfig() {
    return {
      name: "Http Request",
      type: "api",
      description: "Http Request node",
      properties: [],
    }
  }

  async execute(node: NodeInput): Promise<NodeReturn | LinkedList> {
    const setting = node.settings;
    if (setting.method.toUpperCase() == "GET") {
      const response = await axios.get(this.parseExpression(setting.url));
      return response.data;
    }

    if (setting.method.toUpperCase() == "DELETE") {
      const response = await axios.delete(this.parseExpression(setting.url));
      return response.data;
    }

    const requestBody: { [key: string]: any } = {};
    for (let index = 0; index < setting.body.length; index += 1) {
      const item = setting.body[index];
      if (item.type === "expression") {
        requestBody[item.key] = this.parseExpression(item.value);
        continue;
      }
      requestBody[item.key] = item.value;
    }

    const requestHeaders: { [key: string]: any } = {};
    for (let index = 0; index < setting.headers.length; index += 1) {
      const item = setting.headers[index];
      if (item.type === "expression") {
        requestHeaders[item.key] = this.parseExpression(item.value);
        continue;
      }
      requestHeaders[item.key] = item.value;
    }

    if (setting.method.toUpperCase() == "PUT") {
      const response = await axios.put(this.parseExpression(setting.url), requestBody, {
        headers: requestHeaders
      });
      return response?.data || {};
    }

    const response = await axios.post(this.parseExpression(setting.url), requestBody, {
      headers: requestHeaders
    });
    return response?.data || {};
  }
}
