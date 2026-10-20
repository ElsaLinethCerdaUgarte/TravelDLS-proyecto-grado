import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['id_driver'])
      table.dropColumn('id_driver')

      table
        .integer('id_company')
        .unsigned()
        .references('idCompany')
        .inTable('companies')
        .onDelete('CASCADE')
        .notNullable()
        .after('idOrder')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['id_company'])
      table.dropColumn('id_company')
      table.integer('id_driver').unsigned().references('idDriver').inTable('drivers')
    })
  }
}
