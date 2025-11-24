import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"
import Redis from "ioredis"

class RedisNode extends NodeBase {
    constructor(state: any) {
        super(state);
    }

    getConfig(): NodeConfig {
        return {
            name: "redis",
            type: "redis",
            description: "Redis Node",
            properties: [
                {
                    label: "Database Url",
                    name: "databaseUrl",
                    type: "text",
                    required: true,
                    default: ""
                },
                {
                    label: "Command",
                    name: "command",
                    type: "select",
                    required: true,
                    default: "get",
                    options: [
                        {
                            label: "Get",
                            value: "get"
                        },
                        {
                            label: "Set",
                            value: "set"
                        },
                        {
                            label: "Del",
                            value: "del"
                        }
                    ]
                },
                {
                    label: "Key",
                    name: "key",
                    type: "text",
                    required: true,
                    default: null,
                },
                {
                    label: "Value",
                    name: "value",
                    type: "text",
                    required: false,
                    default: null,
                    conditionShow: [
                        { keyCheck: "command", valueExpected: "set" }
                    ]
                },
                {
                    label: "TTL",
                    name: "ttl",
                    type: "number",
                    required: true,
                    default: 5,
                    conditionShow: [
                        { keyCheck: "command", valueExpected: "set" }
                    ]
                }
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;
        if (
            !setting.databaseUrl ||
            !setting.command ||
            !setting.key) {
            throw new Error("Invalid settings. You need to provide a database url, command and key");
        }

        const redisClient = new Redis(this.parseExpression(setting.databaseUrl));

        if (setting.command == "get") {
            const result = await redisClient.get(this.parseExpression(setting.key));
            redisClient.disconnect();
            return { result };
        } else if (setting.command == "set") {
            if (!setting.value) {
                throw new Error("Invalid settings. You need to provide a value when using command 'set'");
            }
            await redisClient.set(
                this.parseExpression(setting.key), 
                this.parseExpression(setting.value), "EX", 
                this.parseExpression(setting.ttl)
            );
        } else if (setting.command == "del") {
            await redisClient.del(this.parseExpression(setting.key));
        }
        redisClient.disconnect();
        return { ok: true };
    }
}

export default RedisNode;