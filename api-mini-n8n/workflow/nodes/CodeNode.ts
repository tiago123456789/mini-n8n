import { NodeBase, NodeInput, NodeReturn } from "core-package-mini-n8n";
const vm = require("vm");

class CodeNode extends NodeBase {

  constructor(state: any) {
    super(state)
  }

  getConfig() {
    return {
      name: "Code",
      type: "code",
      description: "Code node",
      properties: [],
    }
  }

  async execute(node: NodeInput): Promise<NodeReturn> {
    const setting = node.settings;
    let code = `
    ${Buffer.from(setting.code, "base64").toString('utf-8')}
    
    result = node()
    `

    let result = {}
    code = this.parseExpression(code)
    vm.runInThisContext(code, { result: result })
    
    return result
  }
}

export default CodeNode