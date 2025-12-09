import {
  LinkedList,
  NodeBase,
  NodeInput,
  NodeReturn,
} from "core-package-mini-n8n";

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
      ai_description:
        "Node to make HTTP requests to external APIs, services or websites.",
      properties: [
        {
          label: "Method",
          name: "method",
          type: "string",
          required: false,
          default: "GET",
          ai_description:
            "The HTTP method to use for the request (e.g., GET, POST, PUT, DELETE).",
        },
        {
          label: "Endpoint",
          name: "endpoint",
          type: "string",
          required: false,
          default: "",
        },
        {
          label: "Body",
          name: "body",
          type: "array",
          required: false,
          default: [{ key: "value" }],
        },
        {
          label: "Headers",
          name: "headers",
          type: "array",
          required: false,
          default: [{ key: "value" }],
        },
      ],
    };
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
      if (!item.value) {
        continue;
      }

      let value = this.parseExpression(item.value);
      try {
        requestBody[item.key] = JSON.parse(value);
      } catch (error) {
        requestBody[item.key] = value;
      }
    }

    const requestHeaders: { [key: string]: any } = {};
    for (let index = 0; index < setting.headers.length; index += 1) {
      const item = setting.headers[index];

      if (!item.value) {
        continue;
      }

      let value = this.parseExpression(item.value);
      try {
        requestHeaders[item.key] = JSON.parse(value);
      } catch (error) {
        requestHeaders[item.key] = value;
      }
    }

    if (setting.method.toUpperCase() == "POST") {
      const response = await axios.post(
        this.parseExpression(setting.url),
        requestBody,
        {
          headers: requestHeaders,
        }
      );
      return response?.data || {};
    }

    if (setting.method.toUpperCase() == "PUT") {
      const response = await axios.put(
        this.parseExpression(setting.url),
        requestBody,
        {
          headers: requestHeaders,
        }
      );
      return response?.data || {};
    }
  }
}
