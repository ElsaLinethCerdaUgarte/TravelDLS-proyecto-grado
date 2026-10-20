import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Company from '#models/company'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    await db.rawQuery('TRUNCATE TABLE companies RESTART IDENTITY CASCADE')

    const companiesData = [
      {
        ruc: '12345678901',
        businessName: 'Transportes Rápidos S.A.',
        email: 'contacto@tr-rapidos.com',
        photoUrl: 'https://placehold.co/200x200?text=TR',
      },
      {
        ruc: '20987654321',
        businessName: 'Logística Total S.A.C.',
        email: 'info@logistica-total.com',
        photoUrl: 'https://placehold.co/200x200?text=LT',
      },
    ]
    for (const data of companiesData) {
      const user = await User.firstOrCreate(
        { email: data.email },
        {
          name: data.businessName,
          password: 'password123',
          roleId: 2,
        }
      )

      await Company.create({
        ruc: data.ruc,
        businessName: data.businessName,
        photoUrl: data.photoUrl,
        userId: user.idUser,
      })
    }
  }
}
