import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import RoleService from '#services/role_service'

@inject()
export default class RolesController {
  constructor(protected roleService: RoleService) {}

  /**
   * @index
   * @description Lists all roles in the system
   * @tag Roles
   * @responseBody 200 - <Rol>
   */
  async index({ response }: HttpContext) {
    try {
      const roles = await this.roleService.list()
      return response.ok(roles)
    } catch {
      return response.internalServerError({ message: 'Failed to retrieve roles.' })
    }
  }
}
