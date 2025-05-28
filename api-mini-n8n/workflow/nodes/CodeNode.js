const axios = require("axios");

module.exports = class CodeNode {
  constructor(state) {
    this.state = state;
  }

  async execute(node) {
    const setting = node.setting;

    const params = JSON.parse(setting.params)

    const resultParams = {}
    Object.keys(params).forEach(key => {
      try {
        resultParams[key] = eval(params[key])
      } catch (error) {
        resultParams[key] = params[key]
      }
    })

    const { data } = await axios.post(
      process.env.CODE_EXECUTOR_URL,
      {
        code: setting.code,
        params: resultParams
      }
    );
    return data;
  }
};
