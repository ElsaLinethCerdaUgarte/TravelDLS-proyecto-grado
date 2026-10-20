import vine from '@vinejs/vine'
import { DriverStatus } from '#enums/driver_status'

export const createDriverValidator = vine.compile(
  vine.object({
    idCompany: vine.number().exists({ table: 'companies', column: 'idCompany' }).optional(),
    userId: vine.number().exists({ table: 'users', column: 'idUser' }).optional(),
    license: vine.string().trim().minLength(5),
    passport: vine.string().trim().minLength(5),
    // La foto se recibe como archivo (multipart/form-data).
    // El controlador la subirá a Cloudinary y guardará la URL resultante.
    photo: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
      .optional(),
    status: vine.enum(DriverStatus).optional(),
  })
)

export const updateDriverValidator = vine.compile(
  vine.object({
    idCompany: vine.number().exists({ table: 'companies', column: 'idCompany' }).optional(),
    userId: vine.number().exists({ table: 'users', column: 'idUser' }).optional(),
    license: vine.string().trim().minLength(5).optional(),
    passport: vine.string().trim().minLength(5).optional(),
    // La foto se recibe como archivo (multipart/form-data).
    photo: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
      .optional(),
    status: vine.enum(DriverStatus).optional(),
  })
)
