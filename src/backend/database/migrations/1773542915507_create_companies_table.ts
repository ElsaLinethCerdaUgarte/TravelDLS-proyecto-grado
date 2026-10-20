import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'companies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('idCompany')

      table
        .integer('idUser')
        .unsigned()
        .references('idUser')
        .inTable('users')
        .onDelete('CASCADE')
        .nullable()

      table.string('ruc', 20).notNullable().unique()
      table.string('businessName', 255).notNullable()

      table.timestamp('createdAt').notNullable()
      table.timestamp('updatedAt').notNullable()
      table.timestamp('deletedAt').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
