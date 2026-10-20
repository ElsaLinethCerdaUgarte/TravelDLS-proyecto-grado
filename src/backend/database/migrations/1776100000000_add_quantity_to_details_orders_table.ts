import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'details_orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('quantity', 12, 2).notNullable().defaultTo(1)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('quantity')
    })
  }
}
