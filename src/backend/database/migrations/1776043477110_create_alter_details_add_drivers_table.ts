import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'details_orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('id_driver')
        .unsigned()
        .references('idDriver')
        .inTable('drivers')
        .onDelete('SET NULL')
        .nullable()
        .after('id_order')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['id_driver'])
      table.dropColumn('id_driver')
    })
  }
}
