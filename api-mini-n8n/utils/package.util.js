"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PackageUtil {
    async load(customPackages, state = {}) {
        const customNode = [];
        for (const customPackage of customPackages) {
            const instance = await import(`${customPackage}`);
            if (!instance.default["default"]) {
                customNode.push(new instance.default(state));
            }
            else {
                customNode.push(new instance.default.default(state));
            }
        }
        return customNode;
    }
    async loadOne(customPackage, state = {}) {
        const instance = await import(`${customPackage}`);
        if (!instance.default["default"]) {
            return new instance.default(state);
        }
        else {
            return new instance.default.default(state);
        }
    }
}
exports.default = PackageUtil;
//# sourceMappingURL=package.util.js.map