## ABOUT

The project is a mini version of n8n.

Link to video show a little bit about the project: https://www.youtube.com/watch?v=eiW2SZ2YSuc

## Features

- Create workflows
- Edit workflows
- Delete workflows
- Execute workflows via Webhook
- Test the workflow while you are creating it
- Create custom nodes to execute your own logic when you need a customized solution

## What did I learn or reviewed?

- Linked list concept
- Plugin architecture. PS: to use the plugin architecture to create custom nodes
- Build form dynamically
- How to make reference from output data from one node to another node. PS: you can use the output data from one node in another node using the syntax {{this.state.steps.step_name_here.output.key_name}} or {{this.state.steps.step_name_here.input.key_name}}
- How to encrypt sensitive data and store it in the database
- How to decrypt sensitive data when you need to use it
- How to install package in other project where the package is only available in the local machine. Example: inside the dependencies of package.json add the path to the package "package-name": "file:../path/to/package" and execute the command **pnpm install**, so the package will be installed in the project you want to use it

### Node types

- Webhook(WebhookNode) => the start node of workflow. PS: will create a webhook to start the workflow
- Api(HttpRequestNode) => make http requests
- Code(CodeNode) => execute code in runtime
- Condition(ConditionNode) => make conditions
- Loop(LoopNode) => make loops when you need to repeat a nodes 

## Stack

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Docker
- Docker Compose

### Frontend
- NextJs
- TypeScript
- React
- React flow to create workflows

## How to run

- Clone
- Access directory **api-mini-n8n**
- Create .env file based on .env.example    
- Execute command **pnpm run migration:run** to run database migrations and create 
the database tables
- Run docker-compose up --build to run containers: api-mini-n8n, code-executor and mongo
- Access directory **frontend**
- Execute command **pnpm install**
- Execute command **pnpm run start:dev**

## Folder structure

- api-mini-n8n: backend
     - src
        - config: configurations
        - exception: exception from application
        - middlewares: middlewares
        - migrations: database migrations
        - models: models represent database tables
        - repositories: repositories contains database queries
        - services: containers the business logic
        - workflow: contains the workflow engine to execute the workflow and native nodes.
        - utils: contains code support other layers
- frontend: frontend
     - app: pages of the application
     - components: components of the application
     - hooks: hooks of the application
     - types: types of the application
     - utils: utils of the application
- core-package: core package to create custom nodes
     - src
        - types: types to create custom nodes
        - index.ts: main file
- package-examples: examples of custom nodes


## How to create custom nodes

- Copy folder **package-examples/template-package**
- Rename folder to **my-custom-node**
- Access the package.json and change the name to **my-custom-node** and description
- Access the src/index.ts and rename the class name and in the method **getConfig** set configs from custom node. PS: the name and type need to be the same.
- When the package is ready to use, execute the command **pnpm run build** to build the package and execute the command **pnpm publish --public** to publish the package on npm as public package.
- Access the frontend running at http://localhost:3000 and access the link http://localhost:3000/install-custom-packages to install the package.
