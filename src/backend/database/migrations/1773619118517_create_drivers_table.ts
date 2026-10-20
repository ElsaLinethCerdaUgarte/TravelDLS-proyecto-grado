import { BaseSchema } from '@adonisjs/lucid/schema'
import { DriverStatus } from '#enums/driver_status'

export default class extends BaseSchema {
  protected tableName = 'drivers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('idDriver')
      table
        .integer('idCompany')
        .unsigned()
        .references('idCompany')
        .inTable('companies')
        .onDelete('CASCADE')
      table.string('license', 50).notNullable()
      table.string('passport', 50).notNullable()
      table.string('photoUrl').nullable()

      // Estado como Enum
      table.enum('status', Object.values(DriverStatus)).defaultTo(DriverStatus.INACTIVE)
      table.timestamp('createdAt')
      table.timestamp('updatedAt')
      table.timestamp('deletedAt').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
