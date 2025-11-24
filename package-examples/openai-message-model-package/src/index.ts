import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"
import { OpenAI } from 'openai';

class OpenAiMessageModelNode extends NodeBase {
    constructor(state: any) {
        super(state);
    }

    getConfig(): NodeConfig {
        return {
            name: "openai-message-model-mini-n8n",
            type: "openai-message-model-mini-n8n",
            description: "OpenAI Message Model Node",
            properties: [
                {
                    label: "API Key",
                    name: "apiKey",
                    type: "text",
                    required: true,
                    default: null
                },
                {
                    label: "LLM Model",
                    name: "model",
                    type: "text",
                    required: true,
                    default: "gpt-3.5-turbo"
                },
                {
                    label: "System Prompt",
                    name: "systemPrompt",
                    type: "text",
                    required: true,
                    default: "You are a helpful assistant."
                },
                {
                    label: "User Prompt",
                    name: "userPrompt",
                    type: "text",
                    required: true,
                    default: "Tell me a joke."
                }
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;

        if (!setting.apiKey || !setting.userPrompt) {
            throw new Error("Invalid settings. You need to provide a Api key and User Prompt");
        }

        const client = new OpenAI({
            apiKey: this.parseExpression(setting.apiKey),
        });

        const response = await client.chat.completions.create({
            model: this.parseExpression(setting.model),
            messages: [
                {
                    role: "system",
                    content: this.parseExpression(setting.systemPrompt) || ""
                },
                {
                    role: "user",
                    content: this.parseExpression(setting.userPrompt)
                }
            ]
        });

        return { ...response.choices[0] };

    }
}

export default OpenAiMessageModelNode;
