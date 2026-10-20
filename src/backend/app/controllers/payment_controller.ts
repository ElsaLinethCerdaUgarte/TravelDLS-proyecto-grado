import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PaymentService from '#services/payment_service'
import {
  cancelPaymentValidator,
  listPaymentsValidator,
  simulatePaymentValidator,
} from '#validators/payment_validator'

@inject()
export default class PaymentsController {
  constructor(private paymentService: PaymentService) {}

  /**
   * @index
   * @description Lists simulated payments with pagination
   * @tag Payments
   * @responseBody 200 - Paginador de pagos
   */
  async index({ request, response, auth }: HttpContext) {
    const filters = await listPaymentsValidator.validate({
      page: Number(request.input('page', 1)),
      perPage: Number(request.input('perPage', 10)),
      idClient: request.input('idClient') ? Number(request.input('idClient')) : undefined,
      idCompany: request.input('idCompany') ? Number(request.input('idCompany')) : undefined,
      status: request.input('status') || undefined,
      summaryStatus: request.input('summaryStatus') || undefined,
      method: request.input('method') || undefined,
      search: request.input('search') || undefined,
    })

    try {
      const payments = await this.paymentService.list(filters, auth.user!)
      return response.ok(payments)
    } catch {
      return response.internalServerError({ message: 'Failed to retrieve payments.' })
    }
  }

  /**
   * @simulate
   * @description Simulates payment for an approved order price
   * @tag Payments
   * @paramPath id - Order ID - @type(number) @required
   * @responseBody 200 - <Order>
   * @responseBody 404 - Order not found
   * @responseBody 422 - Validation failed / Cannot process payment
   */
  async simulate({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(simulatePaymentValidator)

    try {
      const order = await this.paymentService.simulateOrderPayment(params.id, payload, auth.user!)
      return response.ok(order)
    } catch (error: any) {
      if (error.message === 'Order not found.') {
        return response.notFound({ message: error.message })
      }
      return response.unprocessableEntity({ message: error.message })
    }
  }

  /**
   * @showByOrder
   * @description Finds the payment registered for an order
   * @tag Payments
   * @paramPath id - Order ID - @type(number) @required
   * @responseBody 200 - <Payment>
   * @responseBody 404 - Payment not found
   */
  async showByOrder({ params, response, auth }: HttpContext) {
    try {
      const payment = await this.paymentService.findByOrder(params.id, auth.user!)
      return response.ok(payment)
    } catch {
      return response.notFound({ message: 'Payment not found.' })
    }
  }
  /**
   * @cancel
   * @description Cancels a payment when the related order allows it
   * @tag Payments
   * @paramPath id - Payment ID - @type(number) @required
   * @responseBody 200 - <Payment>
   * @responseBody 404 - Payment not found
   * @responseBody 422 - Cannot cancel payment
   */
  async cancel({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(cancelPaymentValidator)

    try {
      const payment = await this.paymentService.cancel(Number(params.id), payload.reason, auth.user!)
      return response.ok(payment)
    } catch (error: any) {
      if (error.message === 'Payment not found.') {
        return response.notFound({ message: error.message })
      }
      return response.unprocessableEntity({ message: error.message })
    }
  }
}
