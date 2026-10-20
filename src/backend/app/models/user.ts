import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo, hasOne, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { BelongsTo, HasOne, HasMany } from '@adonisjs/lucid/types/relations'
import Rol from '#models/rol'
import Driver from '#models/driver'
import Company from '#models/company'
import Client from '#models/client'
import PasswordResetToken from '#models/password_reset_tokens'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true, columnName: 'idUser' })
  declare idUser: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({ columnName: 'role_id' })
  declare roleId: number

  @belongsTo(() => Rol, { foreignKey: 'roleId' })
  declare role: BelongsTo<typeof Rol>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @hasOne(() => Driver, { foreignKey: 'userId' })
  declare driver: HasOne<typeof Driver>

  @hasOne(() => Company, { foreignKey: 'userId' })
  declare company: HasOne<typeof Company>

  @hasOne(() => Client, { foreignKey: 'userId' })
  declare client: HasOne<typeof Client>

  @hasMany(() => PasswordResetToken, { foreignKey: 'userId' })
  declare passwordResetTokens: HasMany<typeof PasswordResetToken>

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })
}
