import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('custom_nodes', (table) => {
        table.increments('id').primary();
        table.string('package_name').notNullable();
        table.boolean('enabled').notNullable().defaultTo(true);
        table.timestamps(true, true);
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('custom_nodes');
}

