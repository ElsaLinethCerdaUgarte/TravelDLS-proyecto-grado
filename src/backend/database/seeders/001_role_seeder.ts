import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Rol from '#models/rol'
import { Roles } from '#enums/roles'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    await db.rawQuery('TRUNCATE TABLE roles RESTART IDENTITY CASCADE')

    await Rol.createMany([
      { name: Roles.DRIVER },
      { name: Roles.COMPANY },
      { name: Roles.CLIENT },
      { name: Roles.PLATFORM_ADMIN },
    ])
  }
}
