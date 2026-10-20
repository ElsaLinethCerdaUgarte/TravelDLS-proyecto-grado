import vine from '@vinejs/vine'
import { CategoryStatus } from '#enums/category_status'

export const createCategoryValidator = vine.compile(
  vine.object({
    nameCategory: vine.string().trim().minLength(2).maxLength(150),
    status: vine.enum(CategoryStatus).optional(),
  })
)

export const updateCategoryValidator = vine.compile(
  vine.object({
    nameCategory: vine.string().trim().minLength(2).maxLength(150).optional(),
    status: vine.enum(CategoryStatus).optional(),
  })
)
