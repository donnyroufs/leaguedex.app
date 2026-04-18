import { safeStorage } from 'electron'

export class ApiKeyVault {
  public static encrypt(plain: string): string {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('OS-level encryption is not available; cannot store API key securely.')
    }
    return safeStorage.encryptString(plain).toString('base64')
  }

  public static decrypt(cipherB64: string): string {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('OS-level encryption is not available; cannot read stored API key.')
    }
    return safeStorage.decryptString(Buffer.from(cipherB64, 'base64'))
  }

  public static mask(plain: string): string {
    if (plain.length <= 8) return '••••••••'
    return `${plain.slice(0, 3)}••••••••${plain.slice(-4)}`
  }
}
