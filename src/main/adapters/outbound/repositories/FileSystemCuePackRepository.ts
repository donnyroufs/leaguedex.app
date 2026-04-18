import { Result } from '../../../shared-kernel'
import { CuePack, ICuePackRepository, Cue, AudioFileName, CueTrigger } from '../../../hexagon'
import path from 'path'
import fs from 'fs/promises'

const CURRENT_STORAGE_VERSION = 1

type FSCue = {
  id: string
  text: string
  audioUrl: {
    fileName: string
    extension: 'mp3' | 'wav'
    path?: string
  }
  trigger: CueTrigger
  endTime?: number
}

type FSCuePack = {
  id: string
  name: string
  isActive: boolean
  cues: FSCue[]
}

type FSFile = {
  version: number
  packs: FSCuePack[]
}

export class FileSystemCuePackRepository implements ICuePackRepository {
  private readonly _path: string

  private constructor(_path: string) {
    this._path = _path
  }

  private async readCuePacks(): Promise<FSCuePack[]> {
    try {
      const data = await fs.readFile(this._path, 'utf-8')
      const parsed = JSON.parse(data)
      if (!parsed || typeof parsed !== 'object' || !('version' in parsed)) {
        return []
      }
      const file = parsed as FSFile
      if (file.version !== CURRENT_STORAGE_VERSION) {
        return []
      }
      return file.packs
    } catch {
      return []
    }
  }

  public async all(): Promise<Result<CuePack[], Error>> {
    try {
      const fsCuePacks = await this.readCuePacks()
      const cuePacks = fsCuePacks.map((fsCuePack) => this.deserializeCuePack(fsCuePack))
      return Result.ok(cuePacks)
    } catch (error) {
      return Result.err(error as Error)
    }
  }

  public async save(cuePack: CuePack): Promise<Result<void, Error>> {
    try {
      const fsCuePacks = await this.readCuePacks()
      const serializedCuePack = this.serializeCuePack(cuePack)
      const existingIndex = fsCuePacks.findIndex((pack) => pack.id === cuePack.id)

      if (existingIndex >= 0) {
        fsCuePacks[existingIndex] = serializedCuePack
      } else {
        fsCuePacks.push(serializedCuePack)
      }

      await this.writeCuePacks(fsCuePacks)
      return Result.ok()
    } catch (error) {
      return Result.err(error as Error)
    }
  }

  public async load(id: string): Promise<Result<CuePack | null, Error>> {
    try {
      const fsCuePacks = await this.readCuePacks()
      const fsCuePack = fsCuePacks.find((pack) => pack.id === id)
      if (!fsCuePack) {
        return Result.ok(null)
      }
      const cuePack = this.deserializeCuePack(fsCuePack)
      return Result.ok(cuePack)
    } catch (error) {
      return Result.err(error as Error)
    }
  }

  public async removeCue(cueId: string): Promise<Result<void, Error>> {
    try {
      const activeResult = await this.active()
      if (activeResult.isErr() || activeResult.unwrap() === null) {
        return Result.err(new Error('Cue pack not found'))
      }

      const pack = activeResult.unwrap()!
      pack.remove(cueId)
      await this.save(pack)
      return Result.ok()
    } catch (error) {
      return Result.err(error as Error)
    }
  }

  public async remove(id: string): Promise<Result<void, Error>> {
    try {
      const fsCuePacks = await this.readCuePacks()
      const filteredPacks = fsCuePacks.filter((pack) => pack.id !== id)
      await this.writeCuePacks(filteredPacks)
      return Result.ok()
    } catch (error) {
      return Result.err(error as Error)
    }
  }

  public async active(): Promise<Result<CuePack | null, Error>> {
    try {
      const fsCuePacks = await this.readCuePacks()
      const activeFsPack = fsCuePacks.find((cuePack) => cuePack.isActive)
      if (!activeFsPack) {
        return Result.ok(null)
      }
      const activePack = this.deserializeCuePack(activeFsPack)
      return Result.ok(activePack)
    } catch (error) {
      return Result.err(error as Error)
    }
  }

  private async writeCuePacks(cuePacks: FSCuePack[]): Promise<void> {
    const file: FSFile = { version: CURRENT_STORAGE_VERSION, packs: cuePacks }
    await fs.writeFile(this._path, JSON.stringify(file, null, 2))
  }

  private serializeCuePack(cuePack: CuePack): FSCuePack {
    return {
      id: cuePack.id,
      name: cuePack.name,
      isActive: cuePack.isActive,
      cues: cuePack.cues.map((cue) => this.serializeCue(cue))
    }
  }

  private serializeCue(cue: Cue): FSCue {
    return {
      id: cue.id,
      text: cue.text,
      audioUrl: cue.audioUrl.toJSON(),
      trigger: cue.trigger,
      endTime: cue.endTime !== undefined ? Number(cue.endTime) : undefined
    }
  }

  private deserializeCuePack(fsCuePack: FSCuePack): CuePack {
    const cuePack = CuePack.create(fsCuePack.name)

    Object.defineProperty(cuePack, 'id', { value: fsCuePack.id, writable: false })

    if (fsCuePack.isActive) {
      cuePack.activate()
    }

    fsCuePack.cues.forEach((cue) => {
      cuePack.add(this.deserializeCue(cue))
    })

    return cuePack
  }

  private deserializeCue(fsCue: FSCue): Cue {
    return {
      id: fsCue.id,
      text: fsCue.text,
      audioUrl: AudioFileName.fromJSON(fsCue.audioUrl),
      trigger: fsCue.trigger,
      endTime: fsCue.endTime !== undefined ? Number(fsCue.endTime) : undefined
    }
  }

  /**
   * If `cue-packs.json` exists but predates the current storage format, rename it to
   * `cue-packs-legacy.json` so the user can still inspect it, and start with an empty file.
   */
  private static async handleLegacyFile(filePath: string): Promise<void> {
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      const parsed = JSON.parse(data)
      const isCurrentFormat =
        parsed &&
        typeof parsed === 'object' &&
        'version' in parsed &&
        parsed.version === CURRENT_STORAGE_VERSION

      if (isCurrentFormat) return

      const legacyPath = path.join(path.dirname(filePath), 'cue-packs-legacy.json')
      await fs.rename(filePath, legacyPath)
    } catch {
      // file didn't exist or wasn't readable; ignore
    }
  }

  public static async create(basePath: string): Promise<FileSystemCuePackRepository> {
    const filePath = path.join(basePath, 'cue-packs.json')

    await fs.mkdir(path.dirname(filePath), { recursive: true })

    await this.handleLegacyFile(filePath)

    try {
      await fs.access(filePath)
    } catch {
      const empty: FSFile = { version: CURRENT_STORAGE_VERSION, packs: [] }
      await fs.writeFile(filePath, JSON.stringify(empty, null, 2))
    }

    return new FileSystemCuePackRepository(filePath)
  }
}
