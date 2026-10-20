import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Driver from '#models/driver'

export default class extends BaseSeeder {
  async run() {
    await Driver.createMany([
      {
        idCompany: 1,
        userId: 1,
        license: 'LIC-001',
        passport: 'PASS-001',
        photoUrl: 'https://example.com/photo1.jpg',
        status: 'available',
      },
      {
        idCompany: 1,
        userId: 2,
        license: 'LIC-002',
        passport: 'PASS-002',
        photoUrl: 'https://example.com/photo2.jpg',
        status: 'inactive',
      },
    ])
  }
}
