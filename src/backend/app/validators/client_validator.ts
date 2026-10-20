import vine from '@vinejs/vine'
import { ClientType } from '#enums/client_type'

export const createClientValidator = vine.compile(
  vine.object({
    companyName: vine.string().maxLength(255).trim(),
    userId: vine.number().exists({ table: 'users', column: 'idUser' }).optional(),
    ruc: vine.string().maxLength(20).trim(),
    address: vine.string().trim(),
    photo: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
      .optional(),
    typeClient: vine.enum(Object.values(ClientType)),
  })
)

export const updateClientValidator = vine.compile(
  vine.object({
    companyName: vine.string().maxLength(255).trim().optional(),
    userId: vine.number().exists({ table: 'users', column: 'idUser' }).optional(),
    ruc: vine.string().maxLength(20).trim().optional(),
    address: vine.string().trim().optional(),
    photo: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
      .optional(),
    typeClient: vine.enum(Object.values(ClientType)).optional(),
  })
)
