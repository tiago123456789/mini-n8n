import knex from "knex";
import knexfile from "./knexfile";


const db = knex(knexfile as any);


export default db;