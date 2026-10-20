import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Truck from '#models/truck'

export default class Category extends BaseModel {
  public static table = 'truck_categories'

  @column({ isPrimary: true, columnName: 'idCategory' })
  declare idCategory: number

  @column({ columnName: 'nameCategory' })
  declare nameCategory: string

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @hasMany(() => Truck, { foreignKey: 'idCategory' })
  declare trucks: HasMany<typeof Truck>
}
