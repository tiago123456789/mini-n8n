import { NodeBase } from "core-package-mini-n8n";
declare class PackageUtil {
    load(customPackages: Array<string>, state?: any): Promise<Array<NodeBase>>;
    loadOne(customPackage: string, state?: any): Promise<NodeBase>;
}
export default PackageUtil;
//# sourceMappingURL=package.util.d.ts.map