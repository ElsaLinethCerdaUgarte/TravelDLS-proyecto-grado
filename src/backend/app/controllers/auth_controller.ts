import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '#validators/user_validator'
import AuthService from '#services/register_service'
import { Roles } from '#enums/roles'

// Opciones de cookie compartidas — 30 días, httpOnly, misma configuración
// que el CookieAuthMiddleware espera (cookie name: 'auth_token')
const COOKIE_OPTIONS = {
  httpOnly: true, // JavaScript no puede leerla
  secure: app.inProduction,
  sameSite: app.inProduction ? ('none' as const) : ('lax' as const),
  maxAge: 60 * 60 * 24 * 30, // 30 días en segundos
  path: '/',
}

@inject()
export default class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * @signup
   * @description Registra un nuevo cliente. Guarda el token en cookie httpOnly.
   * @tag Auth
   * @requestBody { "name": "string", "email": "string", "password": "string" }
   * @responseBody 201 - { "message": "string", "token": "string", "user": {} }
   * @responseBody 422 - Validation failed
   */
  async signup({ request, auth, response }: HttpContext) {
    const data = await request.validateUsing(signupValidator)
    const result = await this.authService.signupWithRole(data, Roles.CLIENT, auth)

    if (!result.success) {
      return response.unprocessableEntity({ message: result.error })
    }

    // Guardar token en cookie httpOnly
    response.cookie('auth_token', result.tokenValue!, COOKIE_OPTIONS)

    return response.created({
      message: 'Client registered successfully',
      token: result.tokenValue,
      user: result.user,
    })
  }

  /**
   * @login
   * @description Autentica un usuario. Guarda el token en cookie httpOnly.
   * @tag Auth
   * @requestBody { "email": "string", "password": "string" }
   * @responseBody 200 - { "message": "string", "token": "string", "user": {} }
   * @responseBody 401 - Invalid credentials
   */
  async login({ request, auth, response }: HttpContext) {
    const credentials = await request.validateUsing(loginValidator)
    const result = await this.authService.login(credentials, auth)

    if (!result.success) {
      return response.unauthorized({ message: result.error })
    }

    // Guardar token en cookie httpOnly
    response.cookie('auth_token', result.tokenValue!, COOKIE_OPTIONS)

    return response.ok({
      message: 'Login successful',
      token: result.tokenValue,
      user: result.user,
    })
  }

  /**
   * @logout
   * @description Cierra la sesión. Invalida el token y limpia la cookie.
   * @tag Auth
   * @security [BearerAuth]
   * @responseBody 200 - { "message": "string" }
   * @responseBody 401 - Unauthorized
   */
  async logout({ auth, response }: HttpContext) {
    const result = await this.authService.logout(auth)

    if (!result.success) {
      return response.internalServerError({ message: result.error })
    }

    // Limpiar la cookie auth_token
    response.clearCookie('auth_token', { path: '/' })

    return response.ok({ message: 'Logged out successfully' })
  }

  /**
   * @forgotPassword
   * @description Genera un token para resetear la contraseña
   * @tag Auth
   * @requestBody { "email": "string" }
   * @responseBody 200 - { "message": "string", "resetToken": "string" }
   */
  async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    const result = await this.authService.forgotPassword(email)

    if (!result.success) {
      return response.internalServerError({ message: result.error })
    }

    return response.ok({
      message: 'If the email exists, a reset token has been generated.',
      resetToken: result.resetToken,
    })
  }

  /**
   * @resetPassword
   * @description Resetea la contraseña usando el token
   * @tag Auth
   * @requestBody { "token": "string", "newPassword": "string" }
   * @responseBody 200 - { "message": "string" }
   * @responseBody 400 - Invalid or expired token
   */
  async resetPassword({ request, response }: HttpContext) {
    const { token, newPassword } = await request.validateUsing(resetPasswordValidator)
    const result = await this.authService.resetPassword(token, newPassword)

    if (!result.success) {
      return response.badRequest({ message: result.error })
    }

    return response.ok({ message: 'Password reset successfully' })
  }

  /**
   * @me
   * @description Returns the authenticated user's data from the session and their related public profiles IDs.
   * @tag Auth
   * @responseBody 200 - { "idUser": "number", "email": "string", "name": "string", "role": "string", "idClient": "number", "idCompany": "number", "idDriver": "number" }
   * @responseBody 401 - { "message": "Unauthorized" }
   */
  async me({ auth, response }: HttpContext) {
    try {
      // Autenticar y obtener al usuario (si falla, lanza excepción que atrapamos)
      const user = await auth.use('api').authenticate()
      // Cargar relaciones necesarias para extraer los roles y los "IDs públicos"
      await user.load('role')
      await user.load('client')
      await user.load('company')
      await user.load('driver')

      return response.ok({
        idUser: user.idUser,
        email: user.email,
        name: user.name,
        role: user.role?.name || null,
        // Retornar los IDs, si el usuario no tiene ese perfil será null
        idClient: user.client?.idClient || null,
        idCompany: user.company?.idCompany || null,
        idDriver: user.driver?.idDriver || null,
      })
    } catch (error: any) {
      console.error('Error in AuthController.me:', error)
      // Token missing, expired, or invalid OR error loading relations
      return response.unauthorized({ message: 'Unauthorized', error: error.message })
    }
  }
}
