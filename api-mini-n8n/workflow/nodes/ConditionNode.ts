import { LinkedList, NodeBase, NodeInput, NodeReturn } from "core-package-mini-n8n";

export default class ConditionNode extends NodeBase {
  constructor(state: any) {
    super(state)
  }

  getConfig() {
    return {
      name: "Condition",
      type: "condition",
      description: "Condition node",
      properties: [],
    }
  }

  execute(node: NodeInput): Promise<NodeReturn | LinkedList> {
    const setting = node.settings;
    const leftValue = this.parseExpression(setting.condition.left.value)
    const rightValue = this.parseExpression(setting.condition.right.value)

    const operatorMap: {[key: string]: (left: string, right: string) => boolean} = {
      "==": (left: string, right: string) => left == right,
      "===": (left: string, right: string) => left === right,
      "!=": (left: string, right: string) => left != right,
      ">": (left: string, right: string) => left > right,
      "<": (left: string, right: string) => left < right,
      ">=": (left: string, right: string) => left >= right,
      "<=": (left: string, right: string) => left <= right,
    };

    const operator = setting?.condition?.operator;
    if (!operatorMap[operator]) {
      throw new Error("Invalid operator");
    }

    if (operatorMap[operator](leftValue, rightValue)) {
      return setting.success;
    } else {
      return setting.fail;
    }
  }
};
