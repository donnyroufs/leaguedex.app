import { app } from 'electron'
import path, { join } from 'path'
import { readFile } from 'fs/promises'

let cache: string | null = null

// Temporary solution to get the license key from the settings file
export async function getLicenseKey(): Promise<string> {
  const dataPath = app.isPackaged ? app.getPath('userData') : path.join(process.cwd(), 'data')
  const licenseKeyPath = join(dataPath, 'settings.json')

  const settings = JSON.parse(await readFile(licenseKeyPath, 'utf-8'))
  cache = settings.license

  return cache!
}

export async function revalidateLicenseKey(): Promise<void> {
  cache = null
}
