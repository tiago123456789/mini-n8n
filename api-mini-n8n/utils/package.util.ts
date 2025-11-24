import { NodeBase } from "core-package-mini-n8n"

class PackageUtil {
    

    async load(customPackages: Array<string>, state: any = {}): Promise<Array<NodeBase>> {
        const customNode: Array<NodeBase> = []
        for (const customPackage of customPackages) {
            const instance = await import(`${customPackage}`)
            if (!instance.default["default"]) {
                customNode.push(new instance.default(state))
            } else {
                customNode.push(new instance.default.default(state))
            }
        }
        return customNode
    }

    async loadOne(customPackage: string, state: any = {}): Promise<NodeBase> {
        const instance = await import(`${customPackage}`)
        if (!instance.default["default"]) {
            return new instance.default(state)
        } else {
            return new instance.default.default(state)
        }
    }
}

export default PackageUtil