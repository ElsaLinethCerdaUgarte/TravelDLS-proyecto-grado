import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/category'
import { CategoryStatus } from '#enums/category_status'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    await db.rawQuery('TRUNCATE TABLE truck_categories RESTART IDENTITY CASCADE')

    await Category.createMany([
      {
        nameCategory: 'Camión Rígido',
        status: CategoryStatus.ACTIVE,
      },
      {
        nameCategory: 'Camión Articulado (Tráiler)',
        status: CategoryStatus.ACTIVE,
      },
      {
        nameCategory: 'Cisterna / Tanque',
        status: CategoryStatus.ACTIVE,
      },
      {
        nameCategory: 'Plataforma / Cama Baja',
        status: CategoryStatus.ACTIVE,
      },
      {
        nameCategory: 'Camión Refrigerado',
        status: CategoryStatus.ACTIVE,
      },
      {
        nameCategory: 'Volquete / Tolva',
        status: CategoryStatus.ACTIVE,
      },
    ])
  }
}
