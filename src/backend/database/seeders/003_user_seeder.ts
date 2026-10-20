import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Rol from '#models/rol'
import { Roles } from '#enums/roles'

export default class extends BaseSeeder {
  async run() {
    // Obtenemos los roles de la base de datos basándonos en el enum
    const adminRole = await Rol.findByOrFail('name', Roles.PLATFORM_ADMIN)
    const driverRole = await Rol.findByOrFail('name', Roles.DRIVER)
    const companyRole = await Rol.findByOrFail('name', Roles.COMPANY)
    const clientRole = await Rol.findByOrFail('name', Roles.CLIENT)

    // Solo creamos los usuarios si el admin no existe para evitar errores en múltiples ejecuciones
    const adminExists = await User.findBy('email', 'admin@traveldls.com')

    if (!adminExists) {
      await User.createMany([
        {
          name: 'Admin Principal',
          email: 'admin@traveldls.com',
          password: 'password123',
          roleId: adminRole.id,
        },
        {
          name: 'Conductor Prueba',
          email: 'driver@traveldls.com',
          password: 'password123',
          roleId: driverRole.id,
        },
        {
          name: 'Compañía Prueba',
          email: 'company@traveldls.com',
          password: 'password123',
          roleId: companyRole.id,
        },
        {
          name: 'Cliente Prueba',
          email: 'client@traveldls.com',
          password: 'password123',
          roleId: clientRole.id,
        },
      ])
      console.log('Usuarios de prueba creados exitosamente.')
    } else {
      console.log('Los usuarios de prueba ya existían en la base de datos.')
    }
  }
}
