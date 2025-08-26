import { app } from 'electron'
import path, { join } from 'path'
import { readFile, access, constants } from 'fs/promises'

let cache: string | null = null

// Temporary solution to get the license key from the settings file
export async function getLicenseKey(): Promise<string> {
  let dataPath!: string

  if (app != null) {
    dataPath = app.isPackaged ? app.getPath('userData') : path.join(process.cwd(), 'data')
  } else {
    dataPath = path.join(process.cwd(), 'data')
  }

  const licenseKeyPath = join(dataPath, 'settings.json')

  try {
    await access(licenseKeyPath, constants.F_OK)
    const settings = JSON.parse(await readFile(licenseKeyPath, 'utf-8'))
    cache = settings.license
    return cache!
  } catch {
    // File doesn't exist or can't be read, return empty string or default value
    return ''
  }
}

export async function revalidateLicenseKey(): Promise<void> {
  cache = null
}
