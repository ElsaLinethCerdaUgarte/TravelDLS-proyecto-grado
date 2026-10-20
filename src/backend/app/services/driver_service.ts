import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import Driver from '#models/driver'
import logger from '@adonisjs/core/services/logger'
import { DriverStatus } from '#enums/driver_status'

@inject()
export default class DriverService {
  async create({
    data,
  }: {
    data: {
      idCompany?: number
      userId?: number
      license: string
      passport: string
      photoUrl?: string
      status: DriverStatus
    }
  }): Promise<Driver> {
    try {
      const driver = await Driver.create(data)
      logger.info({ idDriver: driver.idDriver }, 'Driver created successfully')
      return driver
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to create driver')
      throw new Error('Failed to create driver.')
    }
  }

  async update(
    id: number,
    data: Partial<{
      idCompany: number
      userId: number
      license: string
      passport: string
      photoUrl: string | null
      status: DriverStatus
    }>
  ): Promise<Driver> {
    try {
      const driver = await Driver.query().whereNull('deletedAt').where('idDriver', id).firstOrFail()

      driver.merge(data)
      await driver.save()

      logger.info({ idDriver: driver.idDriver }, 'Driver updated successfully')
      return driver
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        throw new Error('Driver not found.')
      }
      logger.error({ err: error }, 'Failed to update driver')
      throw new Error('Failed to update driver.')
    }
  }

  async list(
    filters: {
      page?: number
      perPage?: number
      status?: string
      idCompany?: number
      search?: string
      hasTruck?: boolean
      availableForOrders?: boolean
    } = {}
  ) {
    try {
      const page = filters.page || 1
      const perPage = filters.perPage || 10
      // @ts-ignore: TypeScript se confunde por la dependencia circular, pero en runtime funciona
      const query = Driver.query().whereNull('deletedAt').preload('company').preload('user')

      if (filters.status) {
        query.where('status', filters.status)
      }
      if (filters.idCompany) {
        query.where('idCompany', filters.idCompany)
      }
      if (filters.search) {
        query.where((builder) => {
          builder
            .where('license', 'ILIKE', `%${filters.search}%`)
            // @ts-ignore: circular dependency type error
            .orWhereHas('user', (userQuery: any) => {
              userQuery.where('name', 'ILIKE', `%${filters.search}%`)
            })
        })
      }

      if (filters.hasTruck) {
        // @ts-ignore
        query.whereHas('trucks', (truckQuery) => {
          truckQuery.whereNull('deleted_at')
        })
      }

      if (filters.availableForOrders) {
        query.where('status', DriverStatus.AVAILABLE)
        // @ts-ignore
        query.whereHas('trucks', (truckQuery) => {
          truckQuery.whereNull('deleted_at').whereIn('status', ['active', 'activo'])
        })
      }

      return await query.orderBy('idDriver', 'desc').paginate(page, perPage)
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to list drivers')
      throw new Error('Failed to retrieve drivers.')
    }
  }

  async findById(id: number): Promise<Driver> {
    try {
      const driver = await Driver.query()
        .whereNull('deletedAt')
        .where('idDriver', id)
        .preload('company')
        // @ts-ignore: Omitir error de dependencia circular
        .preload('user')
        .firstOrFail()
      return driver
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        throw new Error('Driver not found.')
      }
      logger.error({ err: error }, 'Failed to find driver')
      throw new Error('Failed to find driver.')
    }
  }

  async softDelete(id: number): Promise<void> {
    try {
      const driver = await this.findById(id)
      driver.deletedAt = DateTime.now()
      driver.status = DriverStatus.INACTIVE
      await driver.save()

      logger.info({ idDriver: driver.idDriver }, 'Driver soft-deleted successfully')
    } catch (error: any) {
      if (error.message === 'Driver not found.') {
        throw error
      }
      logger.error({ err: error }, 'Failed to soft-delete driver')
      throw new Error('Failed to soft-delete driver.')
    }
  }
}
