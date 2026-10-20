import { BaseSchema } from '@adonisjs/lucid/schema'
import { OrderStatus } from '#enums/order_status'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('idOrder')
      table
        .integer('id_client')
        .unsigned()
        .references('idClient')
        .inTable('clients')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('id_driver')
        .unsigned()
        .references('idDriver')
        .inTable('drivers')
        .onDelete('CASCADE')
        .notNullable()

      table.enum('status', Object.values(OrderStatus)).notNullable().defaultTo(OrderStatus.PENDING)

      table.timestamp('createdAt').notNullable()
      table.timestamp('updatedAt').notNullable()
      table.timestamp('deletedAt').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
