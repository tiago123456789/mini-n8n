import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists("workflow_executions", (table) => {
    table.increments("id").primary();
    table.text("logs").notNullable();
    table.integer("workflowId").notNullable();
    table.timestamp("startAt").notNullable();
    table.timestamp("endAt").notNullable();
  });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("workflow_executions");
}

