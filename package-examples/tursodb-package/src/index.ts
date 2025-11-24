import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"
import { createClient } from "@libsql/client";

class TursoDBNode extends NodeBase {
    constructor(private readonly state: any) {
        super();
    }

    getConfig(): NodeConfig {
        return {
            name: "tursoDB",
            type: "tursoDB",
            description: "TursoDB Node",
            properties: [
                {
                    label: "Database Url",
                    name: "databaseUrl",
                    type: "text",
                    required: true,
                    default: ""
                },
                {
                    label: "Token",
                    name: "token",
                    type: "text",
                    required: true,
                    default: ""
                },
                {
                    label: "Query",
                    name: "query",
                    type: "textarea",
                    required: true,
                    default: "",
                },
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;
        if (
            !setting.databaseUrl ||
            !setting.token ||
            !setting.query) {
            throw new Error("Invalid settings. You need to provide a database url, token and query");
        }

        const turso = createClient({
            url: this.parseExpression(setting.databaseUrl),
            authToken: this.parseExpression(setting.token),
        });


        let query = this.parseExpression(setting.query);
        const result = await turso.execute(query);

        return { data: result?.rows || [] };
    }
}

export default TursoDBNode;
