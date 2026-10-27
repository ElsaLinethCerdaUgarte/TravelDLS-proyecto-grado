import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import OrderService from '#services/order_service'
import { createOrderValidator, updateOrderValidator } from '#validators/order_validator'

@inject()
export default class OrdersController {
  constructor(private orderService: OrderService) {}

  /**
   * @index
   * @description Lists all orders with pagination
   * @tag Orders
   * @paramQuery page - Page number - @type(number)
   * @paramQuery perPage - Items per page - @type(number)
   * @paramQuery idClient - Optional client ID filter - @type(number)
   * @responseBody 200 - Paginador de órdenes
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 10)
    const idClient = request.input('idClient')
    const idCompany = request.input('idCompany')
    const idDriver = request.input('idDriver')

    try {
      const orders = await this.orderService.list({ page, perPage, idClient, idCompany, idDriver })
      return response.ok(orders)
    } catch {
      return response.internalServerError({ message: 'Failed to retrieve orders.' })
    }
  }

  /**
   * @show
   * @description Finds an order by ID
   * @tag Orders
   * @paramPath id - Order ID - @type(number) @required
   * @responseBody 200 - Objeto de orden con sus detalles
   * @responseBody 404 - Order not found
   */
  async show({ params, response }: HttpContext) {
    try {
      const order = await this.orderService.findById(params.id)
      return response.ok(order)
    } catch {
      return response.notFound({ message: 'Order not found.' })
    }
  }

  /**
   * @store
   * @description Creates a new order header
   * @tag Orders
   * @requestBody { "idClient": "number", "idCompany": "number", "status": "pendiente" }
   * @responseBody 201 - <Order>
   * @responseBody 422 - Validation failed
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createOrderValidator)

    try {
      const order = await this.orderService.create(data)
      return response.created(order)
    } catch (error: any) {
      return response.unprocessableEntity({ message: error.message })
    }
  }

  /**
   * @update
   * @description Updates an existing order header
   * @tag Orders
   * @paramPath id - Order ID - @type(number) @required
   * @requestBody { "idClient": "number?", "idCompany": "number?", "status": "pendiente" }
   * @responseBody 200 - <Order>
   * @responseBody 404 - Order not found
   * @responseBody 422 - Validation failed
   */
  async update({ params, request, response }: HttpContext) {
    const data = await request.validateUsing(updateOrderValidator)

    try {
      const order = await this.orderService.update(params.id, data)
      return response.ok(order)
    } catch (error: any) {
      if (error.message === 'Order not found.') {
        return response.notFound({ message: error.message })
      }
      return response.unprocessableEntity({ message: error.message })
    }
  }

  /**
   * @destroy
   * @description Soft-deletes an order
   * @tag Orders
   * @paramPath id - Order ID - @type(number) @required
   * @responseBody 200 - { "message": "Order deleted successfully." }
   * @responseBody 404 - Order not found
   */
  async destroy({ params, response }: HttpContext) {
    try {
      await this.orderService.softDelete(params.id)
      return response.ok({ message: 'Order deleted successfully.' })
    } catch {
      return response.notFound({ message: 'Order not found.' })
    }
  }

  /**
   * @assignDriver
   * @description Assigns a driver to the first detail of an order
   * @tag Orders
   * @paramPath id - Order ID - @type(number) @required
   * @requestBody { "idDriver": "number" }
   * @responseBody 200 - <Order>
   * @responseBody 404 - Order not found
   * @responseBody 422 - Validation failed / Cannot assign driver
   */
  async assignDriver({ params, request, response }: HttpContext) {
    const idOrder = params.id
    const idDriver = request.input('idDriver')

    try {
      const order = await this.orderService.assignDriver(idOrder, idDriver)
      return response.ok(order)
    } catch (error: any) {
      if (
        error.message === 'Order not found.' ||
        error.message === 'No order detail found to assign driver.'
      ) {
        return response.notFound({ message: error.message })
      }
      return response.unprocessableEntity({ message: error.message })
    }
  }

  /**
   * @assignPrice
   * @description Assigns a price to every detail of an order
   * @tag Orders
   * @paramPath id - Order ID - @type(number) @required
   * @requestBody { "prices": [{ "idDetails": "number", "amount": "number" }] }
   * @responseBody 200 - <Order>
   * @responseBody 404 - Order not found
   * @responseBody 422 - Validation failed / Cannot assign price
   */
  async assignPrice({ params, request, response }: HttpContext) {
    const idOrder = params.id
    const prices = request.input('prices')
    if (
      !Array.isArray(prices) ||
      prices.some(
        (price) =>
          !Number.isInteger(Number(price?.idDetails)) || !Number.isFinite(Number(price?.amount))
      )
    ) {
      return response.unprocessableEntity({ message: 'Indica el precio de cada carga.' })
    }

    try {
      return response.ok(
        await this.orderService.assignPrice(
          idOrder,
          prices.map((price) => ({
            idDetails: Number(price.idDetails),
            amount: Number(price.amount),
          }))
        )
      )
    } catch (error: any) {
      if (
        error.message === 'Order not found.' ||
        error.message === 'No order detail found to assign price.'
      ) {
        return response.notFound({ message: error.message })
      }
      return response.unprocessableEntity({ message: error.message })
    }
  }

  /**
   * @respondPrice
   * @description Responds to an assigned price (accept or deny)
   * @tag Orders
   * @paramPath id - Order ID - @type(number) @required
   * @requestBody { "accepted": "boolean" }
   * @responseBody 200 - <Order>
   * @responseBody 404 - Order not found
   * @responseBody 422 - Validation failed
   */
  async respondPrice({ params, request, response }: HttpContext) {
    const idOrder = params.id
    const accepted = request.input('accepted')

    if (typeof accepted !== 'boolean') {
      return response.unprocessableEntity({ message: 'The accepted field must be a boolean.' })
    }

    try {
      return response.ok(await this.orderService.respondPrice(idOrder, accepted))
    } catch (error: any) {
      if (error.message === 'Order not found.') {
        return response.notFound({ message: error.message })
      }
      return response.unprocessableEntity({ message: error.message })
    }
  }
}
