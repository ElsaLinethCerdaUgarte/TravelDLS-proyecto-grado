import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Client extends BaseModel {
  public static table = 'clients'

  @column({ isPrimary: true, columnName: 'idClient' })
  declare idClient: number

  @column({ columnName: 'companyName' })
  declare companyName: string

  @column()
  declare ruc: string

  @column()
  declare address: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deleted_at' })
  declare deletedAt: DateTime | null

  @column({ columnName: 'user_id' })
  declare userId: number

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @column({ columnName: 'photo_url' })
  declare photoUrl: string | null

  @column({ columnName: 'type_client' })
  declare typeClient: string
}
