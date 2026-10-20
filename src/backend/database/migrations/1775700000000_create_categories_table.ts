import { BaseSchema } from '@adonisjs/lucid/schema'
import { CategoryStatus } from '#enums/category_status'

export default class extends BaseSchema {
  protected tableName = 'truck_categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('idCategory')

      table.string('nameCategory', 150).notNullable().unique()
      table
        .enum('status', Object.values(CategoryStatus))
        .notNullable()
        .defaultTo(CategoryStatus.ACTIVE)

      table.timestamp('createdAt').notNullable()
      table.timestamp('updatedAt').notNullable()
      table.timestamp('deletedAt').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
