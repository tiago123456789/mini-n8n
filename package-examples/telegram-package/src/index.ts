import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"
import axios from "axios"

class TelegramNode extends NodeBase {
    constructor(state: any) {
        super(state);
    }

    getConfig(): NodeConfig {
        return {
            name: "telegram-node-mini-n8n",
            type: "telegram-node-mini-n8n",
            description: "Telegram Node",
            properties: [
                {
                    label: "Message",
                    name: "message",
                    type: "text",
                    required: true,
                    default: ""
                },
                {
                    label: "Chat ID",
                    name: "chat_id",
                    type: "text",
                    required: true,
                    default: null
                },
                {
                    label: "Bot Token",
                    name: "botToken",
                    type: "text",
                    required: true,
                    default: null,
                },
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;

        if (
            !setting.message ||
            !setting.chat_id ||
            !setting.botToken) {
            throw new Error("Invalid settings. You need to provide a Message, Chat ID, Bot Token");
        }

        setting.message = this.parseExpression(setting.message);
        setting.chat_id = this.parseExpression(setting.chat_id);
        setting.botToken = this.parseExpression(setting.botToken);

        await axios.post(
            `https://api.telegram.org/bot${setting.botToken}/sendMessage`,
            {
                chat_id: setting.chat_id,
                text: setting.message
            }
        );
        return { status: "ok" };
    }
}

export default TelegramNode;
