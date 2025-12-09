import WebhookNode from "../workflow/nodes/WebhookNode";
import HttpRequestNode from "../workflow/nodes/HttpRequestNode";
import CodeNode from "../workflow/nodes/CodeNode";
import LoopNode from "../workflow/nodes/LoopNode";
import ConditionNode from "../workflow/nodes/ConditionNode";
import { createAgent, tool } from "langchain";
import z from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NodeBase } from "core-package-mini-n8n";
import { NotFoundException } from "../exception/not-found.exception";

class WorkflowAssistantService {
  private model: any;

  constructor(private customNodes: Array<NodeBase>) {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.7,
    });
  }

  private getCreateTool() {
    return tool(
      async ({ userPrompt }: { userPrompt: string }) => {
        let prompt =
          "You are the assistent to build workflows based the nodes information provide below.\n";
        prompt += "The nodes available are:\n";

        const nativeNodes: Array<NodeBase> = [
          new CodeNode({}),
          new ConditionNode({}),
          new HttpRequestNode({}),
          new LoopNode({}, null),
          new WebhookNode({}),
        ];

        for (let nativeNode of nativeNodes) {
          prompt += `${JSON.stringify({
            ...nativeNode.getConfig(),
            isCustomNode: false,
          })}\n\n`;
        }

        for (let customNode of this.customNodes) {
          prompt += `${JSON.stringify({
            ...customNode.getConfig(),
            isCustomNode: true,
          })}\n\n`;
        }

        prompt += "\n\n MUST ONLY:\n";
        prompt += "- User only the nodes provided to answer the questions\n";
        prompt +=
          "- Need to return the nodes in json format and follow the format of json from Node\n";
        prompt += "- RETURN ONLY the node data in JSON format.";
        prompt +=
          "- If found a valid node return a json ONLY, if not found return the word 'NOT_FOUND' ONLY";
        prompt +=
          "- NO RETURN a json struct like that { node: { key_data_here: value_data_here} } ONLY RETURN a node like: { key_data_here: value_data_here }";

        const agent = createAgent({
          model: this.model,
          tools: [],
          systemPrompt: prompt,
        });

        const result = await agent.invoke({
          messages: {
            type: "user",
            content: userPrompt,
          },
        });

        const response = result.messages[result.messages.length - 1];
        return response?.content || "";
      },
      {
        name: "create_node",
        description: "Call this tool when need to create or add a node",
        schema: z.object({
          userPrompt: z.string().describe("The message user sent"),
        }),
      }
    );
  }

  private getEditNodeTool() {
    return tool(
      async ({
        userPrompt,
        currentNodes,
      }: {
        userPrompt: string;
        currentNodes: string;
      }) => {
        let prompt =
          "You are the assistent to build and edit workflows based the nodes information provide below.\n";
        prompt += "The nodes available are:\n";
        prompt += `Current nodes from worflow: ${currentNodes}`;

        const nativeNodes: Array<NodeBase> = [
          new CodeNode({}),
          new ConditionNode({}),
          new HttpRequestNode({}),
          new LoopNode({}, null),
          new WebhookNode({}),
        ];

        for (let nativeNode of nativeNodes) {
          prompt += `${JSON.stringify({
            ...nativeNode.getConfig(),
            isCustomNode: false,
          })}\n\n`;
        }

        for (let customNode of this.customNodes) {
          prompt += `${JSON.stringify({
            ...customNode.getConfig(),
            isCustomNode: true,
          })}\n\n`;
        }

        prompt += "\n\n MUST ONLY:\n";
        prompt += "- User only the nodes provided to answer the questions\n";
        prompt +=
          "- Need to return the nodes in json format and follow the format of json from Node\n";
        prompt += "- RETURN ONLY the node data in JSON format.";
        prompt +=
          "- If found a valid node return a json ONLY, if not found return the word 'NOT_FOUND' ONLY";
        prompt +=
          "- NO RETURN a json struct like that { node: { key_data_here: value_data_here} } ONLY RETURN a node like: { key_data_here: value_data_here }";

        const agent = createAgent({
          model: this.model,
          tools: [],
          systemPrompt: prompt,
        });

        const result = await agent.invoke({
          messages: {
            type: "user",
            content: userPrompt,
          },
        });

        const response = result.messages[result.messages.length - 1];
        return response?.content || "";
      },
      {
        name: "edit_node",
        description: "Call this tool when need to edit or modify a node",
        schema: z.object({
          userPrompt: z.string().describe("The message user sent"),
          currentNodes: z
            .string()
            .describe("The current nodes from workflow to edit"),
        }),
      }
    );
  }

  private extractJSONFromResponse(response: string): string {
    const regex = /```[\s\S]*?```/g;
    const match = regex.exec(String(response));
    if (match) {
      return match[0].replace("```json", "").replace("```", "");
    }

    return response;
  }

  async processUserMessage(
    currentNodes: Array<{ [key: string]: any }>,
    userPrompt: string
  ): Promise<{ result: string } | string> {
    let prompt =
      "You are the assistent to help to build workflows and use the tools to answer the user instructions.\n";

    prompt += "\n\n MUST ONLY:\n";
    prompt += "- User only the nodes provided to answer the questions\n";
    prompt +=
      "- Need to return the nodes in json format and follow the format of json from Node\n";
    prompt += "- RETURN ONLY the node data in JSON format.";
    prompt +=
      "- If found a valid node return a json ONLY, if not found return the word 'NOT_FOUND' ONLY";
    prompt +=
      "- NO RETURN a json struct like that { node: { key_data_here: value_data_here} } ONLY RETURN a node like: { key_data_here: value_data_here }";

    prompt += "EXTRA INFO:\n";
    prompt +=
      "When I said 'use the output from component trigger api 2' means set value in this format here: {{this.state.steps.trigger_api_2.output}}";
    prompt +=
      "When I said 'use the credential TOKEN or another KEY or sensitive data TOKEN or another key' means set value in this format here: {{this.state.sensitiveData.TOKENorKey}}";

    prompt += `Current nodes from worflow:`;

    for (let currentNode of currentNodes) {
      prompt += `${JSON.stringify(currentNode)}\n\n`;
    }

    const agent = createAgent({
      model: this.model,
      tools: [this.getCreateTool(), this.getEditNodeTool()],
      systemPrompt: prompt,
    });

    const result = await agent.invoke({
      messages: {
        type: "user",
        content: userPrompt,
      },
    });

    const response = result.messages.at(-1)?.content;
    let text: string = String(response);
    if (text == "NOT_FOUND") {
      throw new NotFoundException("Node not found");
    }

    if (response) {
      text = this.extractJSONFromResponse(String(response));
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      return text;
    }
  }
}

export default WorkflowAssistantService;
