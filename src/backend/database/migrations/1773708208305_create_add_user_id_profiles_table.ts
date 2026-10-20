import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('drivers', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .references('idUser')
        .inTable('users')
        .onDelete('CASCADE')
        .after('idDriver')
    })
    this.schema.alterTable('clients', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .references('idUser')
        .inTable('users')
        .onDelete('CASCADE')
        .after('idClient')
    })
  }

  async down() {
    this.schema.alterTable('drivers', (table) => {
      table.dropColumn('user_id')
    })
    this.schema.alterTable('clients', (table) => {
      table.dropColumn('user_id')
    })
  }
}
