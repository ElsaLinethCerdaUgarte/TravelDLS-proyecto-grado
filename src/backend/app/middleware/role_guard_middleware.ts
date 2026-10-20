import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleGuardMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: string[]) {
    const user = ctx.auth.user

    if (user) {
      await user.load('role')
    }

    const allowed = allowedRoles.map((role) => role.toLowerCase())

    const userRole = user?.role?.name?.toLowerCase()

    if (!userRole || !allowed.includes(userRole)) {
      return ctx.response.forbidden({ error: 'Access denied' })
    }

    return next()
  }
}
