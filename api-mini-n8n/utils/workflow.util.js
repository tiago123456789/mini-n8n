"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WorkflowUtil {
    getLogs(steps) {
        const logs = [];
        Object.keys(steps).forEach((key) => {
            logs.push({
                step: key,
                output: steps[key].output,
                input: steps[key].input,
            });
        });
        return logs;
    }
}
exports.default = WorkflowUtil;
//# sourceMappingURL=workflow.util.js.map