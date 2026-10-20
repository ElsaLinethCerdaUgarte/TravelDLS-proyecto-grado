import { inject } from '@adonisjs/core'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import User from '#models/user'
import Rol from '#models/rol'
import PasswordResetToken from '#models/password_reset_tokens'
import { Authenticator } from '@adonisjs/auth'
import { Authenticators } from '@adonisjs/auth/types'
import logger from '@adonisjs/core/services/logger'
import hash from '@adonisjs/core/services/hash'
import { Roles } from '#enums/roles'

export interface AuthResult {
  success: boolean
  tokenValue?: string
  user?: User
  error?: string
  resetToken?: string
}

@inject()
export default class AuthService {
  // Registro genérico (admin — con roleId explícito)
  async register(
    data: { name: string; email: string; password: string; roleId: number },
    auth: Authenticator<Authenticators>
  ): Promise<AuthResult> {
    try {
      const user = await User.create(data)
      const token = await auth.use('api').createToken(user)

      logger.info({ email: user.email, idUser: user.idUser }, 'New user correctly registered')
      return {
        success: true,
        tokenValue: token.value!.release(),
        user,
      }
    } catch (error: any) {
      if (error.code === '23505') {
        return { success: false, error: 'Email or Name already exists.' }
      }
      return { success: false, error: 'Registration failed' }
    }
  }

  // Signup público forzando un rol por nombre
  async signupWithRole(
    data: { name: string; email: string; password: string },
    roleName: Roles,
    auth: Authenticator<Authenticators>
  ): Promise<AuthResult> {
    try {
      const role = await Rol.query().where('name', roleName).firstOrFail()
      const user = await User.create({ ...data, roleId: role.id })
      const token = await auth.use('api').createToken(user)

      logger.info({ email: user.email, idUser: user.idUser, role: roleName }, 'New user signed up')
      return {
        success: true,
        tokenValue: token.value!.release(),
        user,
      }
    } catch (error: any) {
      if (error.code === '23505') {
        return { success: false, error: 'Email or Name already exists.' }
      }
      logger.error({ err: error }, 'Signup failed')
      return { success: false, error: 'Registration failed' }
    }
  }

  // Login
  async login(
    credentials: { email: string; password: string },
    auth: Authenticator<Authenticators>
  ): Promise<AuthResult> {
    try {
      const user = await User.verifyCredentials(credentials.email, credentials.password)
      const token = await auth.use('api').createToken(user)

      logger.info({ email: user.email, idUser: user.idUser }, 'User logged in')
      return {
        success: true,
        tokenValue: token.value!.release(),
        user,
      }
    } catch (error: any) {
      if (error.code === 'E_INVALID_CREDENTIALS') {
        return { success: false, error: 'Invalid email or password.' }
      }
      logger.error({ err: error }, 'Login failed')
      return { success: false, error: 'Login failed' }
    }
  }

  // Logout
  async logout(auth: Authenticator<Authenticators>): Promise<AuthResult> {
    try {
      const user = auth.user!
      await auth.use('api').invalidateToken()

      logger.info({ idUser: user.idUser }, 'User logged out')
      return { success: true }
    } catch (error: any) {
      logger.error({ err: error }, 'Logout failed')
      return { success: false, error: 'Logout failed' }
    }
  }

  // Forgot Password
  async forgotPassword(email: string): Promise<AuthResult> {
    try {
      const user = await User.findBy('email', email)

      if (!user) {
        logger.warn({ email }, 'Forgot password requested for non-existent email')
        return { success: true, resetToken: undefined }
      }

      // Invalidar tokens anteriores
      await PasswordResetToken.query()
        .where('user_id', user.idUser)
        .where('used', false)
        .update({ used: true })

      // Generar token seguro
      const rawToken = randomBytes(32).toString('hex')
      const tokenHash = await hash.use('scrypt').make(rawToken)

      await PasswordResetToken.create({
        userId: user.idUser,
        token: tokenHash,
        used: false,
        expiresAt: DateTime.now().plus({ minutes: 30 }),
      })

      logger.info({ email, idUser: user.idUser }, 'Password reset token generated')

      // TODO: Reemplazar con envío de email cuando se configure un mailer
      return { success: true, resetToken: rawToken }
    } catch (error: any) {
      logger.error({ err: error }, 'Forgot password failed')
      return { success: false, error: 'Failed to process forgot password request.' }
    }
  }

  // Reset Password
  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      const resetRecords = await PasswordResetToken.query()
        .where('used', false)
        .where('expires_at', '>', DateTime.now().toSQL()!)
        .preload('user' as any)

      let matchedRecord: PasswordResetToken | null = null
      for (const record of resetRecords) {
        const isValid = await hash.use('scrypt').verify(record.token, token)
        if (isValid) {
          matchedRecord = record
          break
        }
      }

      if (!matchedRecord) {
        return { success: false, error: 'Invalid or expired reset token.' }
      }

      matchedRecord.used = true
      await matchedRecord.save()

      const user = matchedRecord.user
      user.password = newPassword
      await user.save()

      logger.info({ idUser: user.idUser }, 'Password reset successfully')
      return { success: true }
    } catch (error: any) {
      logger.error({ err: error }, 'Reset password failed')
      return { success: false, error: 'Failed to reset password.' }
    }
  }
}
