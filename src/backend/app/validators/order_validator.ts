import vine from '@vinejs/vine'
import { OrderStatus } from '#enums/order_status'

export const createOrderValidator = vine.compile(
  vine.object({
    idClient: vine.number().exists({ table: 'clients', column: 'idClient' }),
    idCompany: vine.number().exists({ table: 'companies', column: 'idCompany' }),
    status: vine.enum(Object.values(OrderStatus)).optional(),
  })
)

export const updateOrderValidator = vine.compile(
  vine.object({
    idClient: vine.number().exists({ table: 'clients', column: 'idClient' }).optional(),
    idCompany: vine.number().exists({ table: 'companies', column: 'idCompany' }).optional(),
    status: vine.enum(Object.values(OrderStatus)).optional(),
  })
)
