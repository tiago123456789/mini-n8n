import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"
import { Firecrawl } from '@mendable/firecrawl-js';

class FirecrawlNode extends NodeBase {
    constructor(state: { [key: string]: any }) {
        super(state);
    }

    getConfig(): NodeConfig {
        return {
            name: "firecrawl-node-mini-n8n",
            type: "firecrawl-node-mini-n8n",
            description: "Firecrawl Node",
            properties: [
                {
                    label: "API Key",
                    name: "apiKey",
                    type: "text",
                    required: true,
                    default: null
                },
                {
                    label: "URL",
                    name: "url",
                    type: "text",
                    required: true,
                    default: null
                },
                {
                    label: "Format output",
                    name: "format",
                    type: "select",
                    required: true,
                    default: "markdown",
                    options: [
                        { label: "Markdown", value: "markdown" },
                        { label: "HTML", value: "html" }
                    ]
                }
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;

        if (!setting.apiKey || !setting.url) {
            throw new Error("Invalid settings. You need to provide a apiKey and url");
        }

        const format = this.parseExpression(setting.format);
        const firecrawl = new Firecrawl({ 
            apiKey: this.parseExpression(setting.apiKey) 
        });
        const doc = await firecrawl.scrape(
            this.parseExpression(setting.url), 
            // @ts-ignore
            { formats: [format] }
        );
        return { ...doc };
    }
}

export default FirecrawlNode;

