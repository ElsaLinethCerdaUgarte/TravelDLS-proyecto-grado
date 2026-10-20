import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'drivers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['license'])
      table.unique(['passport'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revertimos las restricciones en caso de un rollback
      table.dropUnique(['license'])
      table.dropUnique(['passport'])
    })
  }
}
