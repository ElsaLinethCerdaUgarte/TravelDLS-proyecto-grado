import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'
import { Exception } from '@adonisjs/core/exceptions'
import env from '#start/env'

/**
 * Encrypted payload structure stored in the database.
 * Format: "keyVersion:iv:authTag:encryptedData" (all Base64)
 */
interface EncryptedPayload {
  keyVersion: string
  iv: string
  authTag: string
  encryptedData: string
}

export default class CryptoService {
  private keys: Map<string, Buffer>
  private currentVersion: string

  constructor() {
    const rawKeys = env.get('ENCRYPTION_KEYS')
    this.currentVersion = env.get('ENCRYPTION_CURRENT_KEY_VERSION')

    if (!rawKeys || !this.currentVersion) {
      throw new Exception('ENCRYPTION_KEYS and ENCRYPTION_CURRENT_KEY_VERSION must be set', {
        status: 500,
        code: 'E_CRYPTO_CONFIG_MISSING',
      })
    }

    const parsed: Record<string, string> = JSON.parse(rawKeys)
    this.keys = new Map()

    for (const [version, hexKey] of Object.entries(parsed)) {
      const keyBuffer = Buffer.from(hexKey, 'hex')
      if (keyBuffer.length !== 32) {
        throw new Exception(
          `Encryption key "${version}" must be exactly 32 bytes (256 bits). Got ${keyBuffer.length} bytes.`,
          { status: 500, code: 'E_CRYPTO_INVALID_KEY' }
        )
      }
      this.keys.set(version, keyBuffer)
    }

    if (!this.keys.has(this.currentVersion)) {
      throw new Exception(
        `Current key version "${this.currentVersion}" not found in ENCRYPTION_KEYS`,
        { status: 500, code: 'E_CRYPTO_KEY_VERSION_MISSING' }
      )
    }
  }

  /**
   * Encrypt plaintext using AES-256-GCM with the current key version.
   * Returns a colon-delimited string: "keyVersion:iv:authTag:ciphertext"
   */
  encrypt(plaintext: string): string {
    const key = this.keys.get(this.currentVersion)!
    const iv = randomBytes(12) // 96-bit IV for GCM

    const cipher = createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    const payload: EncryptedPayload = {
      keyVersion: this.currentVersion,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      encryptedData: encrypted.toString('base64'),
    }

    return `${payload.keyVersion}:${payload.iv}:${payload.authTag}:${payload.encryptedData}`
  }

  /**
   * Decrypt a payload string previously produced by encrypt().
   * Supports decryption with any historical key version.
   */
  decrypt(payload: string): string {
    const parts = payload.split(':')
    if (parts.length !== 4) {
      throw new Exception('Invalid encrypted payload format', {
        status: 500,
        code: 'E_CRYPTO_INVALID_PAYLOAD',
      })
    }

    const [keyVersion, ivB64, authTagB64, encryptedDataB64] = parts

    const key = this.keys.get(keyVersion)
    if (!key) {
      throw new Exception(`Encryption key version "${keyVersion}" not found. Cannot decrypt.`, {
        status: 500,
        code: 'E_CRYPTO_KEY_NOT_FOUND',
      })
    }

    const iv = Buffer.from(ivB64, 'base64')
    const authTag = Buffer.from(authTagB64, 'base64')
    const encryptedData = Buffer.from(encryptedDataB64, 'base64')

    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])

    return decrypted.toString('utf8')
  }
}
