FROM node:20-slim   

WORKDIR /app

COPY package.json ./

COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
