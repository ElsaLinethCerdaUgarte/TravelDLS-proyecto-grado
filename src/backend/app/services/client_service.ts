import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import Client from '#models/client'
import logger from '@adonisjs/core/services/logger'
import { ClientType } from '#enums/client_type'

@inject()
export default class ClientService {
  async create({
    data,
  }: {
    data: {
      userId?: number
      companyName: string
      ruc: string
      address: string
      photoUrl?: string | null
      typeClient: ClientType | string
    }
  }): Promise<Client> {
    try {
      const client = await Client.create(data)
      logger.info({ idClient: client.idClient }, 'Client created successfully')
      return client
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error('A client with this RUC already exists.')
      }
      logger.error({ err: error }, 'Failed to create client')
      throw new Error('Failed to create client.')
    }
  }

  async update(
    id: number,
    data: Partial<{
      userId: number
      companyName: string
      ruc: string
      address: string
      photoUrl: string | null
      typeClient: ClientType | string
    }>
  ): Promise<Client> {
    try {
      const client = await Client.query().whereNull('deletedAt').where('idClient', id).firstOrFail()

      client.merge(data)
      await client.save()

      logger.info({ idClient: client.idClient }, 'Client updated successfully')
      return client
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        throw new Error('Client not found.')
      }
      if (error.code === '23505') {
        throw new Error('A client with this RUC already exists.')
      }
      logger.error({ err: error }, 'Failed to update client')
      throw new Error('Failed to update client.')
    }
  }

  async list(
    filters: { page?: number; perPage?: number; search?: string; typeClient?: string } = {}
  ) {
    try {
      const page = filters.page || 1
      const perPage = filters.perPage || 10
      // @ts-ignore
      const query = Client.query().whereNull('deletedAt').preload('user')

      if (filters.search) {
        query.where((builder) => {
          builder
            .where('companyName', 'ILIKE', `%${filters.search}%`)
            .orWhere('ruc', 'ILIKE', `%${filters.search}%`)
            .orWhere('address', 'ILIKE', `%${filters.search}%`)
            // @ts-ignore: circular dependency type error
            .orWhereHas('user', (userQuery: any) => {
              userQuery.where('name', 'ILIKE', `%${filters.search}%`)
            })
        })
      }
      if (filters.typeClient) {
        query.where('typeClient', filters.typeClient)
      }

      return await query.orderBy('idClient', 'desc').paginate(page, perPage)
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to list clients')
      throw new Error('Failed to retrieve clients.')
    }
  }

  async findById(id: number): Promise<Client> {
    try {
      const client = await Client.query().whereNull('deletedAt').where('idClient', id).firstOrFail()
      return client
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        throw new Error('Client not found.')
      }
      logger.error({ err: error }, 'Failed to find client')
      throw new Error('Failed to find client.')
    }
  }

  async softDelete(id: number): Promise<void> {
    try {
      const client = await this.findById(id)
      client.deletedAt = DateTime.now()
      await client.save()

      logger.info({ idClient: client.idClient }, 'Client soft-deleted successfully')
    } catch (error: any) {
      if (error.message === 'Client not found.') {
        throw error
      }
      logger.error({ err: error }, 'Failed to soft-delete client')
      throw new Error('Failed to soft-delete client.')
    }
  }
}
