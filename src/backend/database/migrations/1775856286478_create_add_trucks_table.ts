import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trucks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_truck')

      table
        .integer('id_company')
        .unsigned()
        .references('idCompany')
        .inTable('companies')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('id_driver')
        .unsigned()
        .references('idDriver')
        .inTable('drivers')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('id_category')
        .unsigned()
        .references('idCategory')
        .inTable('truck_categories')
        .onDelete('CASCADE')
        .notNullable()

      table.string('chassis', 100).notNullable()
      table.string('plate', 50).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.timestamp('deleted_at').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
