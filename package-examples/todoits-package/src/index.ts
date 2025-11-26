import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"
import axios from "axios";

class TodoitsNode extends NodeBase {
    constructor(state: any) {
        super(state);
    }

    getConfig(): NodeConfig {
        return {
            name: "todoits-node-mini-n8n", // Name e type needs to be the same
            type: "todoits-node-mini-n8n", // Name e type needs to be the same
            description: "Todoits Node",
            properties: [
                {
                    label: "Api Key",
                    name: "apiKey",
                    type: "text",
                    required: true,
                    default: null
                },
                {
                    label: "Text",
                    name: "text",
                    type: "text",
                    required: true,
                    default: ""
                },
                {
                    label: "Operation",
                    name: "operation",
                    type: "select",
                    required: true,
                    default: "quick_add",
                    options: [
                        {
                            label: "Quick Add",
                            value: "quick_add"
                        },
                        {
                            label: "Get task",
                            value: "get_task"
                        },
                        {
                            label: "Reopen task",
                            value: "reopen_task"
                        }, 
                        {
                            label: "Close task",
                            value: "close_task"
                        }
                    ]
                },
                {
                    label: "Task Id",
                    name: "taskId",
                    type: "text",
                    required: false,
                    default: null,
                    conditionShow: [{
                        keyCheck: "operation",
                        valueExpected: "reopen_task"
                    }]
                },
                {
                    label: "Task Id",
                    name: "taskId",
                    type: "text",
                    required: false,
                    default: null,
                    conditionShow: [{
                        keyCheck: "operation",
                        valueExpected: "close_task"
                    }]
                },
            ]
        }
    }

    private async addTask(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings

        if (setting.text === "" || (setting.text || "").length === 0) {
            throw new Error("Invalid settings. You need to provide a text");
        }

        const response = await axios.post('https://api.todoist.com/api/v1/tasks/quick', {
            text: this.parseExpression(setting.text)
        }, {
            headers: {
                'Authorization': `Bearer ${this.parseExpression(setting.apiKey)}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("adsfasdlfkajsld")
        return { ok: true, data: response.data };
    }

    private async getTasks(node: NodeInput) {
        const setting = node.settings
        const response = await axios.get('https://api.todoist.com/rest/v2/tasks', {
            headers: {
                'Authorization': `Bearer ${this.parseExpression(setting.apiKey)}`,
                'Content-Type': 'application/json'
            }
        });

        return { ok: true, data: response.data };
    }

    private async reopenTask(node: NodeInput) {
        const setting = node.settings

        if (setting.taskId === "" || (setting.taskId || "").length === 0) {
            throw new Error("Invalid settings. You need to provide a taskId");
        }

        const response = await axios.post(
            this.parseExpression(`https://api.todoist.com/api/v2/tasks/${setting.taskId}/reopen`), {}, {
            headers: {
                'Authorization': `Bearer ${this.parseExpression(setting.apiKey)}`,
                'Content-Type': 'application/json'
            }
        });

        return { ok: true, data: response.data };
    }

    private async closeTask(node: NodeInput) {
        const setting = node.settings

        if (setting.taskId === "" || (setting.taskId || "").length === 0) {
            throw new Error("Invalid settings. You need to provide a taskId");
        }
    
        await axios.post(
            this.parseExpression(`https://api.todoist.com/api/v2/tasks/${setting.taskId}/close`), {}, {
            headers: {
                'Authorization': `Bearer ${this.parseExpression(setting.apiKey)}`,
                'Content-Type': 'application/json'
            }
        });

        return { ok: true, data: "close task" };
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;

        if (
            !setting.apiKey ||
            !setting.operation) {
            throw new Error("Invalid settings. You need to provide a apiKey and operation");
        }

        if (setting.operation === "quick_add") {
            return this.addTask(node);
        } else if (setting.operation === "get_task") {
            return this.getTasks(node);
        } else if (setting.operation === "reopen_task") {
            return this.reopenTask(node);
        } else if (setting.operation === "close_task") {
            return this.closeTask(node);
        } else {
            throw new Error("Invalid operation");
        }

    }
}

export default TodoitsNode;
