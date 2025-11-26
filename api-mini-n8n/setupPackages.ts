import { config } from "dotenv"

config();
import CustomNodeRepository from "./repositories/custom-node.repository";
import PackageUtil from "./utils/package.util";


async function run () {
    const packageUtil = new PackageUtil();
    const customNodeRepository = new CustomNodeRepository();

    console.log("Getting the custom nodes to install");
    const register = await customNodeRepository.findAll();
    const packagesCustomNodes = register.map((item) => item.package_name);
    console.log("Starting the process of installing the custom nodes");
    await packageUtil.install(packagesCustomNodes);
    process.exit(0);
}

run()