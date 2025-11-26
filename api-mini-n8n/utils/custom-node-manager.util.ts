import { NodeBase } from "core-package-mini-n8n";
import PackageUtil from "./package.util";


class CustomNodeManager {

    private customNodes: Array<NodeBase> = [];
    private isLoadCustomNodes: boolean = false

    constructor(
        private readonly packagesCustomNodes: Array<string> = [],
        private readonly packageUtil: PackageUtil,
    ) { }

    async init(state: any): Promise<void> {
        if (this.isLoadCustomNodes) {
            return;
        }

        this.customNodes = await this.packageUtil.load(this.packagesCustomNodes, state);
        this.isLoadCustomNodes = true;
    }

    async getCustomNodeByType(type: string, state: any): Promise<NodeBase> {
        await this.init(state);


        const customNode = this.customNodes.find((item) => {
            return item.getConfig().type.toLowerCase() == type.toLowerCase()
        });

        if (!customNode) {
            throw new Error("Custom node not found");
        }

        return customNode;
    }

    async getCustomNodes(state: any): Promise<Array<NodeBase>> {
        await this.init(state);
        return this.customNodes;
    }
}

export default CustomNodeManager