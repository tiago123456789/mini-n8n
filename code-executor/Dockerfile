FROM denoland/deno:latest

ENV PORT 3000

WORKDIR /app

COPY . .

RUN deno install 

RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "main.ts"]