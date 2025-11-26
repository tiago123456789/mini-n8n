import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('workflows', (table) => {
        table.increments('id').primary();
        table.text("data").notNullable();
        table.string('name', 150).notNullable();
        table.string('webhookId').nullable();
        table.timestamps(true, true);
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('workflows');
}


