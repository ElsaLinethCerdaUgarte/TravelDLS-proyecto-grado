import { BaseSchema } from '@adonisjs/lucid/schema'
import { ClientType } from '#enums/client_type'

export default class extends BaseSchema {
  protected tableName = 'clients'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('photo_url', 255).nullable()
      table
        .enum('type_client', Object.values(ClientType))
        .notNullable()
        .defaultTo(ClientType.NATURAL)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('photo_url')
      table.dropColumn('type_client')
    })
  }
}
