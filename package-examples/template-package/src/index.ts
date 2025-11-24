import nodemailer from "nodemailer";
import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"

class ExampleNode extends NodeBase {
    constructor() {
        super();
    }

    getConfig(): NodeConfig {
        return {
            name: "example-node-mini-n8n", // Name e type needs to be the same
            type: "example-node-mini-n8n", // Name e type needs to be the same
            description: "Example Node",
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
        // Execute code logic here

        
        // const setting = node.setting;

        // if (
        //     !setting.host ||
        //     !setting.port ||
        //     !setting.user ||
        //     !setting.password ||
        //     !setting.to ||
        //     !setting.from ||
        //     !setting.subject ||
        //     !setting.body) {
        //     throw new Error("Invalid settings. You need to provide a host, port, user, password, to, from, subject and body");
        // }


        // const transport = nodemailer.createTransport({
        //     host: setting.host,
        //     port: setting.port,
        //     auth: {
        //         user: setting.user,
        //         pass: setting.password
        //     }
        // });

        // await transport.sendMail({
        //     from: setting.from,
        //     to: setting.to,
        //     subject: setting.subject,
        //     text: eval(setting.body)
        // });

        return { ok: true };
    }
}

export default ExampleNode;
