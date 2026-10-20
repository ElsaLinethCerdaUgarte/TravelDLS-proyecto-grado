import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { signupValidator } from '#validators/user_validator'
import AuthService from '#services/register_service'
import { Roles } from '#enums/roles'

@inject()
export default class DriverAuthController {
  constructor(private authService: AuthService) {}

  /**
   * @registerDriver
   * @description Registra un nuevo driver. Guarda el token en cookie httpOnly.
   * @tag Auth
   * @requestBody { "name": "string", "email": "string", "password": "string" }
   * @responseBody 201 - { "message": "string", "token": "string", "user": {} }
   * @responseBody 422 - Validation failed
   */
  async registerDriver({ request, auth, response }: HttpContext) {
    const data = await request.validateUsing(signupValidator)
    const result = await this.authService.signupWithRole(data, Roles.DRIVER, auth)

    if (!result.success) {
      return response.unprocessableEntity({ message: result.error })
    }

    return response.created({
      message: 'Driver registered successfully',
      token: result.tokenValue, // También en body para clientes móviles / Postman
      user: result.user,
    })
  }
}
