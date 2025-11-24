import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

import express, { Request, Response } from "express"
import cors from "cors"

const app = express();

import CustomNodeRepository from "./repositories/custom-node.repository";
import PackageUtil from "./utils/package.util";
import { NodeBase } from "core-package-mini-n8n";
import packageJson from "./package.json";
import WorkflowRepository from "./repositories/workflow.repository";
import Encrypter from "./utils/encrypter.util";
import { randomUUID } from "crypto"
import WorkflowUtil from "./utils/workflow.util";
import CustomNodeService from "./services/custom-node.service";
import { NotFoundException } from "./exception/not-found.exception";
import WorkflowService from "./services/workflow.service";
import handleExceptionMiddleware from "./middleware/handle-exception.middleware";

app.use(express.json());
app.use(cors());


const { execSync } = require('child_process');

let customNodes: Array<NodeBase> = []
const customNodeRepository = new CustomNodeRepository();
const workflowRepository = new WorkflowRepository();
const packageUtil = new PackageUtil();
const encrypter = new Encrypter();
const customNodeService = new CustomNodeService(customNodeRepository);
const workflowUtil = new WorkflowUtil();

const workflowService = new WorkflowService(
  workflowRepository,
  customNodeRepository,
  encrypter,
  workflowUtil,
);

app.get('/custom-nodes-install', async (req: Request, res: Response) => {
  const customNodesItems = await customNodeService.getCustomNodesInstalled();
  return res.json(customNodesItems);
})

app.get('/custom-nodes-install/:id/enable', async (req, res) => {
  const customNode = await customNodeService.enableCustomNode(`${req.params.id}`);
  customNodes.push(await packageUtil.loadOne(customNode.package_name));
  return res.json(customNode);
})

app.get('/custom-nodes-install/:id/disable', async (req, res) => {
  const customNode = await customNodeService.disableCustomNode(`${req.params.id}`);
  return res.json(customNode);
})

app.put('/custom-nodes-update', async (req, res, next) => {
  try {
    const body = req.body;
    const dependencies: { [key: string]: string } = packageJson.dependencies;
    const hasPackage = dependencies[body.packageName];
    if (!hasPackage) {
      throw new NotFoundException("Package not found. You need to install the custom node first");
    }

    execSync(`pnpm update ${body.packageName}`);
    return res.status(204).json({});
  } catch (error: any) {
    return next(error)
  }
})

app.post("/custom-nodes-install", async (req, res) => {
  const body = req.body;
  try {

    if (!body.packageName) {
      return res.status(400).json({
        error: "Package name is required",
      });
    }

    const packageName = await customNodeService.install(body.packageName);
    customNodes.push(await packageUtil.loadOne(packageName));

    return res.json({});
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
})

app.get("/custom-nodes", async (req, res) => {
  await loadCustomNodes()

  const items = customNodes.map((node) => {
    return {
      ...node.getConfig(),
      isCustomNode: true,
    }
  })

  return res.json(items)
})

app.post("/workflows", async (req, res) => {
  const name = req.body.name;
  const workflowByName = await workflowRepository.findByName(name);
  if (workflowByName) {
    return res.status(400).json({
      error: "Workflow already exists",
    });
  }

  const sensitiveData: Array<{ key: string, value: string }> = req.body.sensitiveData;
  if (sensitiveData && sensitiveData.length > 0) {
    const encrypter = new Encrypter();
    const encryptedData: { [key: string]: any } = {};
    sensitiveData.forEach((item) => {
      encryptedData[item.key] = encrypter.encrypt(item.value);
    })
    req.body.sensitiveData = encryptedData;
  } else {
    req.body.sensitiveData = null;
  }

  const firstNode = req.body.nodes[0];
  if (firstNode.type === "webhook") {
    req.body.webhookId = randomUUID();
  }

  const result = await workflowRepository.insertOne({
    name: req.body.name,
    data: {
      ...req.body,
    },
    webhookId: req.body.webhookId,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return res.status(201).json({
    id: result.id,
  });
});

app.use("/webhooks/:id", async (req, res, next) => {
  try {

    await workflowService.triggerByWebhook({
      webhookId: req.params.id,
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
    })

    return res.status(200).json({});

  } catch(error: any) {
    return next(error)
  }
})

app.get("/workflows", async (req, res) => {
  const workflows = await workflowService.getWorkflows();
  return res.json({
    data: workflows || [],
  });
});

app.use("/workflows/:id/trigger", async (req, res, next) => {
  try {
    await workflowService.trigger({
      workflowId: req.params.id,
      body: req?.body || {},
      query: req?.query || {},
      params: req?.params || {},
      headers: req?.headers || {},
    })
  
    return res.sendStatus(200);
  } catch(error) {
    return next(error)
  }
  
});

app.get("/workflows/:id/executions", async (req, res) => {
  const results = await workflowService.getExecutionLogs(req.params.id);
  return res.json(results);
});

app.post("/run-workflows", async (req, res, next) => {
  try {
    const logs = await workflowService.runWorkflow({
      sensitiveData: req.body.sensitiveData,
      isEditMode: req.body.isEditMode,
      workflowId: req.body.workflowId,
      nodes: req.body.nodes,
      contextVariables: req.body.contextVariables,
      body: req.body.body,
      query: req.body.query,
      params: req.body.params,
      headers: req.body.headers,
    });

    return res.json({
      logs: logs,
    });
  } catch (error: any) {
    return next(error)
  }

});

app.get("/workflows/:id", async (req, res, next) => {
  try {
    const result = await workflowService.getById(req.params.id);

    return res.json({
      data: result,
    });
  } catch(error) {
    return next(error)
  }
});

app.delete("/workflows/:id", async (req, res) => {
  await workflowService.deleteOne(req.params.id);
  return res.sendStatus(204);
});

app.use(handleExceptionMiddleware);

async function loadCustomNodes() {
  const register = await customNodeRepository.findAllEnabled();
  const packagesName = register.map((item) => item.package_name);
  customNodes = await packageUtil.load(packagesName);
}

// Optional: Keep app.listen() for local development
if (process.env.NODE_ENV === 'development') {
  app.listen(5000, async () => {
    console.log("Server running at port 5000");
  });

}

const application: any = app

export default application;


