import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

export default {
    client: 'cockroachdb',
    connection: process.env.DB_URL,
    migrations: {
        directory: '../migrations',
    },
    seeds: {
        directory: '../seeds',
    },
}