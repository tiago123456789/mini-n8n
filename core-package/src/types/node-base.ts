import { LinkedList } from "./linkedlist";

export interface NodeReturn {
    [key: string]: any;
}

export interface NodeInput {
    [key: string]: any;
    settings: {
        [key: string]: any;
    }
}

export interface NodeProperty {
    label: string,
    name: string,
    type: string,
    required: boolean,
    default: any,
    options?: Array<{
        label: string,
        value: string,
    }>,
    conditionShow?: Array<{
        keyCheck: string,
        valueExpected: string,
    }>,
    ai_description?: string
}

export interface NodeConfig {
    name: string,
    type: string,
    description: string,
    ai_description?: string
    properties: Array<NodeProperty>
}

export abstract class NodeBase {

    protected state: any;   

    constructor(state: any) {
        this.state = state;
    }

    parseExpression(expression: string): string {
        const regex = /{{(.*?)}}/g;
        const matches = expression.match(regex);
        if (matches) {
            matches.forEach((match) => {
                const key = match.replace("{{", "").replace("}}", "");
                let value = eval(key);
                if (typeof value == "object") {
                    value = JSON.stringify(value);
                }
                expression = expression.replace(match, value);
            })
        }
        return expression;
    }

    getConfig(): NodeConfig {
        throw new Error("Method not implemented");
    }

    execute(input: NodeInput): Promise<NodeReturn | LinkedList> {
        throw new Error("Method not implemented");
    }
}
    