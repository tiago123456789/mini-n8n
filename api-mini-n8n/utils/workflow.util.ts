
class WorkflowUtil {

    getLogs(steps: any) {
        const logs: Array<{ step: string, output: any, input: any }> = [];
        Object.keys(steps).forEach((key) => {
            logs.push(
                {
                    step: key,
                    output: steps[key].output,
                    input: steps[key].input,
                }
            )
        })
        return logs;
    }
}

export default WorkflowUtil
