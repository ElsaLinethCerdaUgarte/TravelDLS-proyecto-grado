import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import Order from '#models/order'
import { OrderStatus } from '#enums/order_status'
import Driver from '#models/driver'
import { DriverStatus } from '#enums/driver_status'

@inject()
export default class OrderService {
  async create(data: {
    idClient: number
    idCompany: number
    status?: OrderStatus
  }): Promise<Order> {
    try {
      const order = await Order.create(data)
      logger.info({ idOrder: order.idOrder }, 'Order header created successfully')
      return order
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to create order')
      throw new Error('Failed to create order.')
    }
  }

  async update(
    id: number,
    data: Partial<{ idClient: number; idCompany: number; status: OrderStatus }>
  ): Promise<Order> {
    try {
      const orderAnterior = await this.findById(id)
      const order = await Order.query().whereNull('deletedAt').where('idOrder', id).firstOrFail()

      if (orderAnterior.status === OrderStatus.ANNULLED && data.status === OrderStatus.IN_TRANSIT) {
        throw new Error('No se puede iniciar una orden anulada.')
      }

      order.merge(data)
      await order.save()

      // Driver status sync logic
      if (
        data.status === OrderStatus.IN_TRANSIT &&
        orderAnterior.status !== OrderStatus.IN_TRANSIT
      ) {
        const detail = orderAnterior.details[0]
        if (detail?.idDriver) {
          const driver = await Driver.findOrFail(detail.idDriver)
          driver.status = DriverStatus.ONTRIP as any
          await driver.save()
        }
      } else if (
        (data.status === OrderStatus.DELIVERED || data.status === OrderStatus.CANCELLED) &&
        orderAnterior.status === OrderStatus.IN_TRANSIT
      ) {
        const detail = orderAnterior.details[0]
        if (detail?.idDriver) {
          const activeTripsCount = await db
            .from('details_orders')
            .innerJoin('orders', 'details_orders.id_order', 'orders.idOrder')
            .where('details_orders.id_driver', detail.idDriver)
            .where('orders.status', OrderStatus.IN_TRANSIT)
            .whereNull('orders.deletedAt')
            .count('* as total')
            .first()

          if (Number(activeTripsCount?.total || 0) === 0) {
            const driver = await Driver.findOrFail(detail.idDriver)
            if (driver.status === (DriverStatus.ONTRIP as any)) {
              driver.status = DriverStatus.AVAILABLE as any
              await driver.save()
            }
          }
        }
      }

      logger.info({ idOrder: order.idOrder }, 'Order updated successfully')
      return order
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND' || error.message === 'Order not found.') {
        throw new Error('Order not found.')
      }
      if (error.message === 'No se puede iniciar una orden anulada.') {
        throw error
      }
      logger.error({ err: error }, 'Failed to update order')
      throw new Error('Failed to update order.')
    }
  }

  async list(
    filters: {
      page?: number
      perPage?: number
      idClient?: number
      idCompany?: number
      idDriver?: number
    } = {}
  ) {
    try {
      const page = filters.page || 1
      const perPage = filters.perPage || 10
      const query = Order.query()
        .whereNull('deletedAt')
        .preload('client', (clientQuery: any) => clientQuery.preload('user'))
        .preload('company')
        .preload('details', (detailsQuery: any) => {
          detailsQuery.whereNull('deletedAt')
          detailsQuery.preload('driver', (dq: any) => {
            dq.preload('user')
          })
        })
        // @ts-ignore
        .preload('payment')

      if (filters.idClient) {
        query.where('idClient', filters.idClient)
      }
      if (filters.idCompany) {
        query.where('idCompany', filters.idCompany)
      }
      if (filters.idDriver) {
        query.whereHas('details', (dq) => {
          dq.where('idDriver', filters.idDriver!)
        })
      }

      return await query.orderBy('idOrder', 'desc').paginate(page, perPage)
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to list orders')
      throw new Error('Failed to retrieve orders.')
    }
  }

  async findById(id: number): Promise<Order> {
    try {
      return await Order.query()
        .whereNull('deletedAt')
        .where('idOrder', id)
        .preload('client', (clientQuery: any) => clientQuery.preload('user'))
        .preload('company')
        .preload('details', (detailsQuery: any) => {
          detailsQuery.whereNull('deletedAt')
          detailsQuery.preload('driver', (dq: any) => dq.preload('user'))
        })
        // @ts-ignore
        .preload('payment')
        .firstOrFail()
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        throw new Error('Order not found.')
      }
      logger.error({ err: error }, 'Failed to find order')
      throw new Error('Failed to find order.')
    }
  }

  async softDelete(id: number): Promise<void> {
    try {
      const order = await this.findById(id)
      order.deletedAt = DateTime.now()
      await order.save()
      logger.info({ idOrder: order.idOrder }, 'Order soft-deleted successfully')
    } catch (error: any) {
      if (error.message === 'Order not found.') throw error
      logger.error({ err: error }, 'Failed to soft-delete order')
      throw new Error('Failed to soft-delete order.')
    }
  }

  async assignDriver(idOrder: number, idDriver: number): Promise<Order> {
    try {
      const order = await this.findById(idOrder)

      // Validation: max 5 active trips for this driver
      const activeTripsCount = await db
        .from('details_orders')
        .innerJoin('orders', 'details_orders.id_order', 'orders.idOrder')
        .where('details_orders.id_driver', idDriver)
        .whereIn('orders.status', ['pendiente', 'en_transito'])
        .whereNull('details_orders.deletedAt')
        .whereNull('orders.deletedAt')
        .count('* as total')
        .first()
      const count = Number(activeTripsCount?.total || 0)
      if (count >= 5) {
        throw new Error('El conductor ya tiene el máximo de 5 viajes activos permitidos.')
      }

      const detail = order.details[0]
      if (!detail) {
        throw new Error('No order detail found to assign driver.')
      }

      detail.idDriver = idDriver
      await detail.save()
      return await this.findById(idOrder)
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        throw new Error('Order not found.')
      }
      throw error
    }
  }

  async assignPrice(idOrder: number, amount: number): Promise<Order> {
    try {
      const order = await this.findById(idOrder)
      const detail = order.details[0]
      if (!detail) {
        throw new Error('No order detail found to assign price.')
      }

      detail.amount = amount
      await detail.save()

      order.status = OrderStatus.WAITING_APPROVAL as string
      await order.save()

      logger.info({ idOrder, amount }, 'Price assigned to order detail successfully')

      return await this.findById(idOrder)
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        throw new Error('Order not found.')
      }
      logger.error({ err: error }, 'Failed to assign price to order')
      throw error
    }
  }

  async respondPrice(idOrder: number, accepted: boolean): Promise<Order> {
    try {
      const order = await this.findById(idOrder)
      if (accepted) {
        order.status = OrderStatus.ACCEPTED as string
      } else {
        order.status = OrderStatus.DENIED as string
      }
      await order.save()

      logger.info({ idOrder, accepted }, 'Order price responded successfully')

      return order
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        throw new Error('Order not found.')
      }
      logger.error({ err: error }, 'Failed to respond to order price')
      throw error
    }
  }
}
