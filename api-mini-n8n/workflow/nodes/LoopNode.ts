import { LinkedList, NodeBase, NodeInput, NodeReturn } from "core-package-mini-n8n";
export default class LoopNode extends NodeBase {

    private engine: any;

    constructor(state: any, engine: any) {
        super(state);
        this.engine = engine;
    }

    getConfig() {
        return {
            name: "Loop",
            type: "loop",
            description: "Loop node",
            properties: [],
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn | LinkedList> {
        const setting = node.settings;
        const source = eval(setting.source);

        const steps: { [key: string]: any } = {
            [node.name]: {
                currentItem: null
            }
        }

        const workflowToRun = {
            id: "test",
            triggerEvent: "manual",
            nodes: setting.nodes,
            steps: steps,
            contextVariables: this.state.contextVariables || {},
            sensitiveData: this.state.sensitiveData || {},
        }

        for (let index = 0; index < source.length; index += 1) {
            const item = source[index];
            steps[node.name].currentItem = item
            await this.engine.process(workflowToRun)
        }

        this.state.steps = {...this.state.steps, ...steps}
        return {};
    }
};
