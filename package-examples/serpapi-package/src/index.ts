import axios from "axios";
import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"

class SerpapiNode extends NodeBase {
    constructor(state: any) {
        super(state);
    }

    getConfig(): NodeConfig {
        return {
            name: "serpapi-node-mini-n8n",
            type: "serpapi-node-mini-n8n",
            description: "Serpapi Node",
            properties: [
                {
                    label: "API Key",
                    name: "apiKey",
                    type: "text",
                    required: true,
                    default: null
                },
                {
                    label: "Type",
                    name: "type",
                    type: "select",
                    options: [
                        {
                            label: "Google Events",
                            value: "google_events"
                        },
                        {
                            label: "Google Jobs",
                            value: "google_jobs"
                        },
                        {
                            label: "Google News",
                            value: "google_news"
                        },
                        {
                            label: "Google Flights",
                            value: "google_flights"
                        },
                    ],
                    required: true,
                    default: null
                },
                {
                    label: "Search query",
                    name: "searchQuery",
                    type: "text",
                    required: true,
                    default: null
                },
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;

        if (!setting.apiKey || !setting.type || !setting.searchQuery) {
            throw new Error("Invalid settings. You need to provide a apiKey, type and searchQuery");
        }

        try {
            const url = `https://serpapi.com/search.json?engine=${this.parseExpression(setting.type)}&q=${this.parseExpression(setting.searchQuery)}&api_key=${this.parseExpression(setting.apiKey)}&hl=en`
            const response = await axios.get(url)
            return { ...response.data };
        } catch (error: any) {
            throw new Error(error);
        }
    }
}

export default SerpapiNode;