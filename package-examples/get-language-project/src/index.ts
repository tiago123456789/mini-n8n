import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"
import axios from "axios";
class GetLanguageProjectNode extends NodeBase {
    constructor(state: any) {
        super(state);
    }

    getConfig(): NodeConfig {   
        return {
            name: "get-language-project-node-mini-n8n", // Name e type needs to be the same
            type: "get-language-project-node-mini-n8n", // Name e type needs to be the same
            description: "Get Language Project Node",
            properties: [
                {
                    label: "Github username",
                    name: "username",
                    type: "text",
                    required: true,
                    default: null
                },
                {
                    label: "Github repository",
                    name: "repository",
                    type: "text",
                    required: true,
                    default: ""
                },
                {
                    label: "Test select",
                    name: "testSelect",
                    type: "select",
                    required: true,
                    default: "option1",
                    options: [
                        {
                            label: "Option 1",
                            value: "option1"
                        },
                        {
                            label: "Option 2",
                            value: "option2"
                        }
                    ]
                }
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;

        if (!setting.username || !setting.repository) {
            throw new Error("Invalid settings. You need to provide a username and repository");
        }
        
        const url = this.parseExpression(`https://api.github.com/repos/${setting.username}/${setting.repository}/languages`);

        const response = await axios.get(url);
        return { ok: true, data: response.data }
    }
}

export default GetLanguageProjectNode;
