FROM node:20-slim   

ENV DB_URL=""
ENV ENCRYPT_KEY=""

WORKDIR /app

COPY package.json ./

COPY pnpm-lock.yaml ./

COPY . .

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm run build


EXPOSE 5000

CMD ["node", "dist/index.js"]
