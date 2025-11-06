import { IFileSystem } from '@hexagon/ports/IFileSystem'
import fs from 'fs/promises'
import path from 'path'

export class FileSystem implements IFileSystem {
  public async clearDirectory(directoryPath: string): Promise<void> {
    try {
      await fs.access(directoryPath)
    } catch {
      return
    }

    const files = await fs.readdir(directoryPath)

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(directoryPath, file)
        const stat = await fs.stat(filePath)

        if (stat.isFile()) {
          await fs.unlink(filePath)
        } else if (stat.isDirectory()) {
          await this.clearDirectory(filePath)

          await fs.rmdir(filePath)
        }
      })
    )
  }
}
