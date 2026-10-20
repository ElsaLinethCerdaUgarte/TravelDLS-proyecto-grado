import { BaseSchema } from '@adonisjs/lucid/schema'
import { PaymentMethod } from '#enums/payment_method'
import { PaymentStatus } from '#enums/payment_status'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('idPayment')
      table
        .integer('id_order')
        .unsigned()
        .references('idOrder')
        .inTable('orders')
        .onDelete('CASCADE')
        .notNullable()
        .unique()
      table
        .integer('id_client')
        .unsigned()
        .references('idClient')
        .inTable('clients')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('id_company')
        .unsigned()
        .references('idCompany')
        .inTable('companies')
        .onDelete('CASCADE')
        .notNullable()

      table.decimal('amount', 12, 2).notNullable()
      table.enum('status', Object.values(PaymentStatus)).notNullable().defaultTo(PaymentStatus.PAID)
      table.enum('method', Object.values(PaymentMethod)).notNullable()
      table.string('billingEmail', 255).notNullable()
      table.string('cardHolderName', 255).nullable()
      table.string('cardBrand', 50).nullable()
      table.string('last4', 4).nullable()
      table.string('transferReference', 100).nullable()
      table.string('referenceCode', 40).notNullable().unique()
      table.timestamp('paidAt').nullable()

      table.timestamp('createdAt').notNullable()
      table.timestamp('updatedAt').notNullable()
      table.timestamp('deletedAt').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
