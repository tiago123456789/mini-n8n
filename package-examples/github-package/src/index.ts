import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"

class GithubNode extends NodeBase {
    constructor(state: any) {
        super(state);
    }

    getConfig(): NodeConfig {
        return {
            name: "github-node-mini-n8n", // Name e type needs to be the same
            type: "github-node-mini-n8n", // Name e type needs to be the same
            description: "Github node",
            properties: [
                {
                    label: "Github username",
                    name: "username",
                    type: "text",
                    required: true,
                    default: null
                },
                {
                    label: "Operation",
                    name: "operation",
                    type: "select",
                    required: true,
                    default: "getProfile",
                    options: [
                        {
                            label: "Get Repos",
                            value: "getRepos"
                        },
                        {
                            label: "Get Profile",
                            value: "getProfile"
                        },
                        {
                            label: "Get a specific repo",
                            value: "getSpecificRepo"
                        }
                    ]
                }, 
                {
                    label: "Repo name",
                    name: "repoName",
                    type: "text",
                    required: false,
                    default: null,
                    conditionShow: [
                        {
                            keyCheck: "operation",
                            valueExpected: "getSpecificRepo"
                        }
                    ]
                }
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;

        if (!setting.username) {
            throw new Error("Invalid settings. You need to provide a username");
        }

        setting.username = this.parseExpression(setting.username);
        setting.repoName = this.parseExpression(setting.repoName);

        if (setting.operation === "getRepos") {
            const response = await fetch(`https://api.github.com/users/${setting.username}/repos`);
            const data = await response.json();
            return { ok: true, data };
        } else if (setting.operation === "getProfile") {
            const response = await fetch(`https://api.github.com/users/${setting.username}`);
            const data = await response.json();
            return { ok: true, data };
        } else if (setting.operation === "getSpecificRepo") {
            try {
                const response = await fetch(`https://api.github.com/repos/${setting.username}/${setting.repoName}`);
                const data = await response.json();
                return { ok: true, data };
            } catch(error: any) {
                return { ok: false, error: error.message };
            }
        }

        return { ok: true };
    }
}

export default GithubNode;
