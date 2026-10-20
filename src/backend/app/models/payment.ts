import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'
import Client from '#models/client'
import Company from '#models/company'

export default class Payment extends BaseModel {
  public static table = 'payments'

  @column({ isPrimary: true, columnName: 'idPayment' })
  declare idPayment: number

  @column({ columnName: 'id_order' })
  declare idOrder: number

  @column({ columnName: 'id_client' })
  declare idClient: number

  @column({ columnName: 'id_company' })
  declare idCompany: number

  @column()
  declare amount: number

  @column()
  declare status: string

  @column()
  declare method: string

  @column({ columnName: 'billingEmail' })
  declare billingEmail: string

  @column({ columnName: 'cardHolderName' })
  declare cardHolderName: string | null

  @column({ columnName: 'cardBrand' })
  declare cardBrand: string | null

  @column({ columnName: 'last4' })
  declare last4: string | null

  @column({ columnName: 'transferReference' })
  declare transferReference: string | null

  @column({ columnName: 'referenceCode' })
  declare referenceCode: string

  @column({ columnName: 'cancellationReason' })
  declare cancellationReason: string | null

  @column.dateTime({ columnName: 'paidAt' })
  declare paidAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @belongsTo(() => Order, { foreignKey: 'idOrder' })
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => Client, { foreignKey: 'idClient' })
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => Company, { foreignKey: 'idCompany' })
  declare company: BelongsTo<typeof Company>
}
