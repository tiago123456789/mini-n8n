import { execSync } from "child_process";
import CustomNodeModel from "../models/custom-node.model";
import CustomNodeRepository from "../repositories/custom-node.repository";
import { BusinessException } from "../exception/business.exception";

class CustomNodeService {

    constructor(
        private customNodeRepository: CustomNodeRepository
    ) {

    }

    async getCustomNodesInstalled(): Promise<Array<CustomNodeModel>> {
        const customNodesItems = await this.customNodeRepository.findAll();
        return customNodesItems;
    }

    async disableCustomNode(id: string) {
        const customNode = await this.customNodeRepository.update(id, { enabled: false });
        return customNode;
    }

    async enableCustomNode(id: string) {
        const customNode = await this.customNodeRepository.update(id, { enabled: true });
        return customNode;
    }

    async install(packageName: string): Promise<string> {
        const customNode = await this.customNodeRepository.findByName(packageName);
        
        if (customNode) {
            throw new BusinessException(`Custom node ${packageName} already installed.`);
        }

        console.log(`Installing ${packageName}...`);

        execSync(`pnpm install ${packageName}`);

        console.log(`${packageName} installed successfully.`);

        await this.customNodeRepository.insertOne({
            package_name: packageName,
            enabled: true,
        });

        return packageName;
    }
}

export default CustomNodeService;
