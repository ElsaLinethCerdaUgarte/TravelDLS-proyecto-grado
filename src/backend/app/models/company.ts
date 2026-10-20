import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Driver from '#models/driver'
import User from '#models/user'
import Truck from '#models/truck'
import Order from '#models/order'

export default class Company extends BaseModel {
  public static table = 'companies'

  @column({ isPrimary: true, columnName: 'idCompany' })
  declare idCompany: number

  @column()
  declare ruc: string

  @column({ columnName: 'businessName' })
  declare businessName: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @column({ columnName: 'idUser' })
  declare userId: number | null

  @column({ columnName: 'photo_url' })
  declare photoUrl: string | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Driver, { foreignKey: 'idCompany' })
  declare drivers: HasMany<typeof Driver>

  @hasMany(() => Truck, { foreignKey: 'idCompany' })
  declare trucks: HasMany<typeof Truck>

  @hasMany(() => Order, { foreignKey: 'idCompany' })
  declare orders: HasMany<typeof Order>
}
