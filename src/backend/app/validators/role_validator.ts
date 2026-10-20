import vine from '@vinejs/vine'
import { Roles } from '#enums/roles'

export const createRoleValidator = vine.compile(
  vine.object({
    name: vine.enum(Object.values(Roles)),
  })
)
