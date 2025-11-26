import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"
import axios from "axios"

class ParallelHttpRequestNode extends NodeBase {
    constructor(state: any) {
        super(state);
    }

    getConfig(): NodeConfig {
        return {
            name: "parallel-http-request-node-mini-n8n", // Name e type needs to be the same
            type: "parallel-http-request-node-mini-n8n", // Name e type needs to be the same
            description: "Parallel Http Request Node",
            properties: [
                {
                    label: "Urls(use comma(,) to separate urls)",
                    name: "urls",
                    type: "text",
                    required: true,
                    default: null
                },
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;

        if (!setting.urls) {
            throw new Error("Invalid settings. You need to provide a urls");
        }

        const urls = setting.urls.split(",");
        
        if (urls.length === 0) {
            throw new Error("Invalid settings. You need to provide a urls");
        }

        const promises = urls.map((url: string) => axios.get(url));
        
        const responses = await Promise.all(promises);
        
        const data = responses.map((response: any) => response.data);
        
        return { data };
    }
}

export default ParallelHttpRequestNode;
