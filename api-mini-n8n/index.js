const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const cors = require("cors");

const app = express();
const WorkflowEngine = require("./workflow/WorkflowEgine");

require('./config/db');

const WorkflowModal = require("./collection/workflow");

app.use(express.json());
app.use(cors("*"));

app.post("/", async (req, res) => {
  const name = req.body.name;
  const workflowByName = await WorkflowModal.findOne({ name });
  if (workflowByName) {
    return res.status(400).json({
      error: "Workflow already exists",
    });
  }

  await WorkflowModal.insertOne({
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  });
  return res.json({
    message: "ok",
  });
});


app.put("/:id", async (req, res) => {
  await WorkflowModal.updateOne({
    _id: req.params.id
  },
    {
      $set: {
        ...req.body,
        updated_at: new Date(),
      }
    });

  return res.json({
    message: "ok",
  });
});

app.get("/workflows", async (req, res) => {
  const results = await WorkflowModal.find({});
  return res.json({
    data: results,
  });
});

app.use("/workflows/:id/trigger", async (req, res) => {
  const result = await WorkflowModal.findOne({ _id: req.params.id });
  if (!result) {
    return res.status(404).json({
      error: "Workflow not found",
    });
  }

  const workflowToRun = {
    id: req.params.id,
    triggerEvent: result.triggerEvent,
    nodes: result.nodes,
    steps: {},
    contextVariables: result.contextVariables,
  };

  const w = new WorkflowEngine();
  await w.process(workflowToRun, {
    body: req.body || {},
    querystring: req.querystring || {},
    params: req.params || {},
    header: req.headers || {},
  });

  return res.json({
    data: result,
  });
});


app.get("/workflows/:id", async (req, res) => {
  const result = await WorkflowModal.findOne({ _id: req.params.id });
  if (!result) {
    return res.status(404).json({
      error: "Workflow not found",
    });
  }

  return res.json({
    data: result,
  });
});

app.delete("/workflows/:id", async (req, res) => {
  await WorkflowModal.deleteOne({ _id: req.params.id });
  return res.sendStatus(204);
});


app.listen(5000, () => {
  console.log("Server running at port 5000");
});
