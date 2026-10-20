import vine from '@vinejs/vine'
import { PaymentMethod } from '#enums/payment_method'
import { PaymentStatus } from '#enums/payment_status'

export const simulatePaymentValidator = vine.compile(
  vine.object({
    method: vine.enum(Object.values(PaymentMethod)),
    billingEmail: vine.string().email().normalizeEmail(),
    cardHolderName: vine.string().trim().minLength(3).maxLength(255).optional(),
    cardNumber: vine.string().trim().minLength(12).maxLength(23).optional(),
    expiry: vine.string().trim().minLength(4).maxLength(5).optional(),
    cvc: vine.string().trim().minLength(3).maxLength(4).optional(),
    transferReference: vine.string().trim().minLength(4).maxLength(100).optional(),
  })
)

export const listPaymentsValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    perPage: vine.number().positive().optional(),
    idClient: vine.number().exists({ table: 'clients', column: 'idClient' }).optional(),
    idCompany: vine.number().exists({ table: 'companies', column: 'idCompany' }).optional(),
    status: vine.enum(Object.values(PaymentStatus)).optional(),
    summaryStatus: vine.enum(Object.values(PaymentStatus)).optional(),
    method: vine.enum(Object.values(PaymentMethod)).optional(),
    search: vine.string().trim().maxLength(100).optional(),
  })
)

export const cancelPaymentValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().minLength(5).maxLength(500),
  })
)