FROM denoland/deno:latest

WORKDIR /app

COPY . .

RUN deno install 

RUN deno cache main.ts

EXPOSE 3005

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "main.ts"]