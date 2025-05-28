## ABOUT

The project is a mini version of n8n.

### Node types

- Webhook(WebhookNode)
- Api(HttpRequestNode)
- Code(CodeNode)
- Condition(ConditionNode)

## Stack

### Backend
- NodeJs
- Express
- Mongodb
- Docker
- Docker Compose

### Code executor

- Deno(allow to install packages in runtime)
- Typescript

### Frontend
- NextJs
- TypeScript


## How to run

- Clone
- Access directory **api-mini-n8n**
- Create .env file based on .env.example    
- Run docker-compose up --build to run containers: api-mini-n8n, code-executor and mongo
- Access directory **frontend**
- Execute command **pnpm install**
- Execute command **pnpm run dev**

