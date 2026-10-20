import Role from '#models/rol'
import logger from '@adonisjs/core/services/logger'

export default class RoleService {
  /**
   * Obtiene todos los roles
   */
  async list() {
    try {
      return await Role.query().orderBy('id', 'asc')
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to list roles')
      throw new Error('Failed to retrieve roles.')
    }
  }
}
