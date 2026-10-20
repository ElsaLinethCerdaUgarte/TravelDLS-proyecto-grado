import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Client from '#models/client'
import DetailsOrder from '#models/details_order'
import Company from '#models/company'
import OrderTracking from '#models/order_tracking'
import Payment from '#models/payment'

export default class Order extends BaseModel {
  public static table = 'orders'

  @column({ isPrimary: true, columnName: 'idOrder' })
  declare idOrder: number

  @column({ columnName: 'id_client' })
  declare idClient: number

  @column({ columnName: 'id_company' })
  declare idCompany: number

  @column({
    prepare: (value?: string) => value || 'pendiente',
  })
  declare status: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @belongsTo(() => Client, { foreignKey: 'idClient' })
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => Company, { foreignKey: 'idCompany' })
  declare company: BelongsTo<typeof Company>

  @hasMany(() => DetailsOrder, { foreignKey: 'idOrder' })
  declare details: HasMany<typeof DetailsOrder>

  @hasOne(() => OrderTracking, { foreignKey: 'orderId', localKey: 'idOrder' })
  declare tracking: HasOne<typeof OrderTracking>

  @hasOne(() => Payment, { foreignKey: 'idOrder', localKey: 'idOrder' })
  declare payment: HasOne<typeof Payment>
}
