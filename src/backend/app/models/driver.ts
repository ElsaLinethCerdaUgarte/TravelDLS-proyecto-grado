import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Company from '#models/company'
import User from '#models/user'
import Truck from '#models/truck'

export default class Driver extends BaseModel {
  public static table = 'drivers'

  @column({ isPrimary: true, columnName: 'idDriver' })
  declare idDriver: number

  @column({ columnName: 'idCompany' })
  declare idCompany: number

  @column()
  declare license: string

  @column()
  declare passport: string

  @column({ columnName: 'photoUrl' })
  declare photoUrl: string | null

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @column({ columnName: 'user_id' })
  declare userId: number

  @belongsTo(() => Company, { foreignKey: 'idCompany' })
  declare company: BelongsTo<typeof Company>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Truck, { foreignKey: 'idDriver' })
  declare trucks: HasMany<typeof Truck>
}
