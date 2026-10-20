import { PackagingType } from '#enums/orders_packaging_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'details_orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('idDetails')

      table
        .integer('id_order')
        .unsigned()
        .references('idOrder')
        .inTable('orders')
        .onDelete('CASCADE')
        .notNullable()

      table.string('cargoDescription', 255).notNullable()
      table.decimal('amount', 12, 2).notNullable()
      table.string('unitWeight', 50).notNullable()
      table.string('deliveryAddress', 255).notNullable()

      table
        .enum('typePackaging', Object.values(PackagingType))
        .notNullable()
        .defaultTo(PackagingType.PALLET)

      table.timestamp('createdAt').notNullable()
      table.timestamp('updatedAt').notNullable()
      table.timestamp('deletedAt').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
