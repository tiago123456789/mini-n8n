import db from "../config/db";
import CustomNodeModel from "../models/custom-node.model";

class CustomNodeRepository {

    async findAll(): Promise<Array<CustomNodeModel>> {
        const registers = await db("custom_nodes").select("*");
        return registers.map((register) => {
            return {
                id: register.id,
                package_name: register.package_name,
                enabled: register.enabled
            }
        });
    }

    async findByName(name: string): Promise<CustomNodeModel | null> {
        const register = await db("custom_nodes").select("*").where("package_name", name).limit(1);
        return register[0] as CustomNodeModel;
    }

    async findAllEnabled(): Promise<Array<CustomNodeModel>> {
        const registers = await db("custom_nodes").select("*").where("enabled", true);
        return registers.map((register) => {
            return {
                id: register.id,
                package_name: register.package_name,
                enabled: register.enabled
            }
        });
    }

    async update(id: string, data: { [key: string]: any }): Promise<any> {
        const updatedCustomNode = await db("custom_nodes").update(data).where("id", id).returning("*");
        return updatedCustomNode[0];
    }

    async insertOne(data: { [key: string]: any }): Promise<any> {
        const insertedCustomNode = await db("custom_nodes").insert(data).returning("*");
        return insertedCustomNode[0];
    }
}


export default CustomNodeRepository;
