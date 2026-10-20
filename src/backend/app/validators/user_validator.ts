import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255).trim(),
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8),
    roleId: vine.number().exists({ table: 'roles', column: 'id' }),
  })
)

// Signup público (sin roleId — se asigna automáticamente)
export const signupValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255).trim(),
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8),
  })
)

// Login
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(1),
  })
)

// Forgot password
export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

// Reset password
export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string(),
    newPassword: vine.string().minLength(8),
  })
)
