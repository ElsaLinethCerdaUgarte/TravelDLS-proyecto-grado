import type { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
export default class HttpLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Start high-precision timer before processing the request
    const startTime = process.hrtime()

    await next()

    // Calculate duration by subtracting the start time from the current time
    const endTime = process.hrtime(startTime)
    const duration = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2) + 'ms'

    const { request, response, auth } = ctx

    const userEmail = auth?.user?.email ?? 'guest'

    // Use of Adonis' native logger
    ctx.logger.info(
      {
        method: request.method(),
        url: request.url(),
        status: response.getStatus(),
        duration: duration,
        email: userEmail,
      },
      'HTTP Request'
    )
  }
}
