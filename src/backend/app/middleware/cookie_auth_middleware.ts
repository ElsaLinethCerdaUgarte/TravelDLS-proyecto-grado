import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Bridges the httpOnly auth cookie to the Authorization header so the
 * existing tokensGuard can authenticate without any changes to config/auth.ts.
 */
export default class CookieAuthMiddleware {
  async handle({ request }: HttpContext, next: NextFn) {
    const tokenFromCookie = request.cookie('auth_token')

    if (tokenFromCookie && !request.header('authorization')) {
      request.request.headers['authorization'] = `Bearer ${tokenFromCookie}`
      request.headers()['authorization'] = `Bearer ${tokenFromCookie}`
    }

    return next()
  }
}
