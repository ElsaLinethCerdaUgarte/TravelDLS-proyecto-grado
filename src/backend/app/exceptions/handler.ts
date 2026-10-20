import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  // Show stack trace only outside of production
  protected debug = !app.inProduction

  async handle(error: any, ctx: HttpContext) {
    const status = error.status || 500
    const code = error.code || 'E_INTERNAL_SERVER_ERROR'
    const message = error.message || 'Internal Server Error'

    // Validation errors
    if (code === 'E_VALIDATION_ERROR') {
      return ctx.response.status(status).send({
        status: 'error',
        code,
        message: 'Validation failed',
        errors: error.messages,
      })
    }

    // Generic error response
    return ctx.response.status(status).send({
      status: 'error',
      code,
      message,
      ...(this.debug ? { stack: error.stack } : {}),
    })
  }

  // Error reporting to logger
  async report(error: any, ctx: HttpContext) {
    if (this.shouldReport(error)) {
      ctx.logger.error(
        {
          err: error,
          code: error.code,
          msg: error.message,
        },
        'Request failed'
      )
    }
  }
}
