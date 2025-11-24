import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"

import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';

class BullMQNode extends NodeBase {

    private redisConnection: Redis | null;
    constructor(state: any) {
        super(state);
        this.redisConnection = null;
    }

    getConfig(): NodeConfig {
        return {
            name: "bullmq",
            type: "bullmq",
            description: "BullMQ Node",
            properties: [
                {
                    label: "Redis Url",
                    name: "redisUrl",
                    type: "text",
                    required: true,
                    default: ""
                },
                {
                    label: "Operation",
                    name: "operation",
                    type: "select",
                    required: true,
                    default: "publish",
                    options: [
                        {
                            label: "Publish",
                            value: "publish"
                        },
                        {
                            label: "Consumer",
                            value: "consumer"
                        },
                    ]
                },
                {
                    label: "Queue Name",
                    name: "queueName",
                    type: "text",
                    required: true,
                    default: null,
                },
                {
                    label: "Job Data",
                    name: "jobData",
                    type: "textarea",
                    required: false,
                    default: null,
                    conditionShow: [
                        { keyCheck: "operation", valueExpected: "publish" }
                    ]
                },
            ]
        }
    }

    initRedis(url: string) {
        this.redisConnection = new Redis(url, {
            maxRetriesPerRequest: null
        });

        return new Promise((resolve, reject) => {
            this.redisConnection?.on('connect', () => {
                resolve({});
            });

            this.redisConnection?.on('error', (err) => {
                reject(err);
            });

            this.redisConnection?.on('close', () => {
                reject(new Error("Redis connection closed"));
            });

            this.redisConnection?.on('end', () => {
                reject(new Error("Redis connection closed"));
            });

        });
    }

    async publish(node: NodeInput) {
        const setting = node.settings;
        await this.initRedis(this.parseExpression(setting.redisUrl));

        let queue = null;
        try {
            queue = new Queue(
                this.parseExpression(setting.queueName),
                {
                    connection: this.redisConnection as Redis
                }
            );

            if (!setting.jobData) {
                throw new Error("Job data is required");
            }

            let jobData = this.parseExpression(setting.jobData);
            await queue.add("job", JSON.parse(jobData));

            return {
                publishStatus: 'ok',
            }
        } catch (error) {
            throw error;
        } finally {
            await queue?.close();
            await this.redisConnection?.quit();
        }
    }

    async consumer(node: NodeInput): Promise<NodeReturn | null> {
        const setting = node.settings;
        await this.initRedis(this.parseExpression(setting.redisUrl));

        const worker = new Worker(
            this.parseExpression(setting.queueName),
            null,
            {
                connection: this.redisConnection as Redis
            }
        );

        const token = randomUUID();
        const job = await worker.getNextJob(token);
        if (job) {
            await job.moveToCompleted("", token, false);
        }

        await worker.close();
        await this.redisConnection?.quit();
        if (!job) {
            return null
        }

        return job.data
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;
        if (
            !setting.queueName ||
            !setting.redisUrl
        ) {
            throw new Error("Invalid settings. You need to provide a queue name and redis url");
        }

        let result: NodeReturn | null = null;
        if (setting.operation === "publish") {
            result = await this.publish(node);
        } else if (setting.operation === "consumer") {
            result = await this.consumer(node);
        }

        if (result === null) {
            return {}
        }

        return result
    }

}

export default BullMQNode;
