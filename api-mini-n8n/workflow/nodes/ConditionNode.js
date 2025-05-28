module.exports = class ConditionNode {
  constructor(state) {
    this.state = state;
  }

  execute(node) {
    const setting = node.setting;

    const leftValue =
      setting.condition.left.type == "raw"
        ? setting.condition.left.value
        : eval(setting.condition.left.value);

    const rightValue =
      setting.condition.right.type == "raw"
        ? setting.condition.right.value
        : eval(setting.condition.right.value);

    const operatorMap = {
      "==": (left, right) => left == right,
      "===": (left, right) => left === right,
      "!=": (left, right) => left != right,
      ">": (left, right) => left > right,
      "<": (left, right) => left < right,
      ">=": (left, right) => left >= right,
      "<=": (left, right) => left <= right,
    };

    if (operatorMap[setting.condition.operator](leftValue, rightValue)) {
      return setting.success;
    } else {
      return setting.fail;
    }
  }
};
