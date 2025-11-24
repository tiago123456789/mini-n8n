import { NodeBase } from "core-package-mini-n8n";
import PackageUtil from "./package.util";
declare class CustomNodeManager {
    private readonly packagesCustomNodes;
    private readonly packageUtil;
    private customNodes;
    private isLoadCustomNodes;
    constructor(packagesCustomNodes: Array<string> | undefined, packageUtil: PackageUtil);
    init(state: any): Promise<void>;
    getCustomNodeByType(type: string, state: any): Promise<NodeBase>;
    getCustomNodes(state: any): Promise<Array<NodeBase>>;
}
export default CustomNodeManager;
//# sourceMappingURL=custom-node-manager.util.d.ts.map