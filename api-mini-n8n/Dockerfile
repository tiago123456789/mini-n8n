FROM node:20-slim   

ARG DB_URL=""
ARG ENCRYPT_KEY=""

ENV DB_URL=${DB_URL}
ENV ENCRYPT_KEY=${ENCRYPT_KEY}

WORKDIR /app

COPY package.json ./

COPY pnpm-lock.yaml ./

COPY . .

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm run build

RUN pnpm run setup:packages

EXPOSE 5000

CMD ["node", "dist/index.js"]
