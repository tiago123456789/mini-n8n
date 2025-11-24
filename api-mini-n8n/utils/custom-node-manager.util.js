"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomNodeManager {
    packagesCustomNodes;
    packageUtil;
    customNodes = [];
    isLoadCustomNodes = false;
    constructor(packagesCustomNodes = [], packageUtil) {
        this.packagesCustomNodes = packagesCustomNodes;
        this.packageUtil = packageUtil;
    }
    async init(state) {
        if (this.isLoadCustomNodes) {
            return;
        }
        this.customNodes = await this.packageUtil.load(this.packagesCustomNodes, state);
        this.isLoadCustomNodes = true;
    }
    async getCustomNodeByType(type, state) {
        await this.init(state);
        const customNode = this.customNodes.find((item) => {
            return item.getConfig().type.toLowerCase() == type.toLowerCase();
        });
        if (!customNode) {
            throw new Error("Custom node not found");
        }
        return customNode;
    }
    async getCustomNodes(state) {
        await this.init(state);
        return this.customNodes;
    }
}
exports.default = CustomNodeManager;
//# sourceMappingURL=custom-node-manager.util.js.map