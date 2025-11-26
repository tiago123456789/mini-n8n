import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"
import { knex } from "knex";

class PostgresNode extends NodeBase {
    constructor(state: any) {
        super(state);
    }

    getConfig(): NodeConfig {
        return {
            name: "postgresdb",
            type: "postgresdb",
            description: "PostgresDB Node",
            properties: [
                {
                    label: "Database Url",
                    name: "databaseUrl",
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
            !setting.query
        ) {
            throw new Error("Invalid settings. You need to provide a database url and query");
        }

        const db = knex({
            client: "pg",
            connection: {
                connectionString: this.parseExpression(setting.databaseUrl),
            },
        });

        let query = this.parseExpression(setting.query);
        const result = await db.raw(query);
        await db.destroy();
        return { data: result?.rows || [] };

    }
}

export default PostgresNode;

