import express from "npm:express";
import { Buffer } from "node:buffer";

const app = express();

app.use(express.json());

const runCode = async (code: string, params: { [key: string]: any }) => {
  const filePath = `./temp_script_${Date.now()}.ts`;
  // @ts-ignore
  await Deno.writeTextFile(filePath, code);

  const module = await import(`./${filePath}?ts=${Date.now()}`); // prevent module caching
  const data = await module.node(params);

  // @ts-ignore
  await Deno.remove(filePath);

  return data;
};

app.get("/health", (req, res) => {
  res.sendStatus(200);
});

app.post("/execute", async (req, res) => {
  let code = req.body.code;
  let params = req.body.params || {};
  code = Buffer.from(code, "base64").toString("utf-8");
  const data = await runCode(code, params);
  res.json(data);
});

// @ts-ignore
app.listen(process.env.PORT || "3005", () => console.log("Server is running"));
