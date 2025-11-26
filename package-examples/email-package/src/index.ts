import nodemailer from "nodemailer";
import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"

class EmailNode extends NodeBase {
    constructor(private readonly state: { [key: string]: any }) {
        super();
    }

    getConfig(): NodeConfig {
        return {
            name: "email-node-mini-n8n",
            type: "email-node-mini-n8n",
            description: "Email Node",
            properties: [
                {
                    label: "host",
                    name: "host",
                    type: "text",
                    required: true,
                    default: null
                },
                {
                    label: "port",
                    name: "port",
                    type: "number",
                    required: true,
                    default: "2525"
                },
                {
                    label: "user",
                    name: "user",
                    type: "text",
                    required: true,
                    default: null,
                },
                {
                    label: "password",
                    name: "password",
                    type: "text",
                    required: true,
                    default: null,
                },
                {
                    label: "Email from",
                    name: "from",
                    type: "text",
                    required: true,
                    default: null,
                },
                {
                    label: "Email to",
                    name: "to",
                    type: "text",
                    required: true,
                    default: null,
                },
                {
                    label: "Subject",
                    name: "subject",
                    type: "text",
                    required: true,
                    default: null,
                },
                {
                    label: "Body",
                    name: "body",
                    type: "text",
                    required: true,
                    default: "",
                }
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;

        if (
            !setting.host ||
            !setting.port ||
            !setting.user ||
            !setting.password ||
            !setting.to ||
            !setting.from ||
            !setting.subject ||
            !setting.body) {
            throw new Error("Invalid settings. You need to provide a host, port, user, password, to, from, subject and body");
        }


        const host = this.parseExpression(setting.host);
        const transport = nodemailer.createTransport({
            // @ts-ignore
            host: host,
            port: this.parseExpression(setting.port),
            auth: {
                user: this.parseExpression(setting.user),
                pass: this.parseExpression(setting.password)
            }
        });

        await transport.sendMail({
            from: this.parseExpression(setting.from),
            to: this.parseExpression(setting.to),
            subject: this.parseExpression(setting.subject),
            text: this.parseExpression(setting.body)
        });

        return { ok: true };
    }
}

export default EmailNode;
