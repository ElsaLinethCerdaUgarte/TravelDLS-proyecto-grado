import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    // Drop the old constraint to allow new enum values in PostgreSQL
    this.schema.raw('ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_status_check"')
  }

  async down() {
    // Cannot easily restore old check constraint if there are new values
  }
}
