const axios = require("axios");

module.exports = class HttpRequestNode {
  constructor(state) {
    this.state = state;
  }

  async execute(node) {
    const setting = node.setting;
    if (setting.method.toUpperCase() == "GET") {
      const response = await axios.get(setting.url);
      return response.data;
    }

    const requestBody = {};
    for (let index = 0; index < setting.body.length; index += 1) {
      const item = setting.body[index];
      if (item.type === "expression") {
        requestBody[item.key] = eval(item.value);
        continue;
      }
      requestBody[item.key] = item.value;
    }


    const requestHeaders = {};
    for (let index = 0; index < setting.headers.length; index += 1) {
      const item = setting.headers[index];
      if (item.type === "expression") {
        requestHeaders[item.key] = eval(item.value);
        continue;
      }
      requestHeaders[item.key] = item.value;
    }

    const response = await axios.post(setting.url, requestBody, {
      headers: requestHeaders
    });
    return response.data;
  }
};
