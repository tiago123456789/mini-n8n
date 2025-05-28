const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema({
    originalWorkflow: {
        type: Object,
        required: true,
    },
}, { strict: false });

const WorkflowModal = mongoose.model("Workflow", workflowSchema);

module.exports = WorkflowModal;