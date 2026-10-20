import { BaseCommand } from '@adonisjs/core/ace'
import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swaggerConfig from '#config/swagger'

export default class DocsGenerate extends BaseCommand {
  static commandName = 'docs:generate'
  static description = 'Generate Swagger OpenAPI files'
  static options = {
    startApp: true,
  }

  async run() {
    await import('#start/routes')

    if (!router.commited) {
      router.commit()
    }

    await AutoSwagger.default.writeFile(router.toJSON(), swaggerConfig)
    this.logger.success('Swagger OpenAPI files generated')
  }
}