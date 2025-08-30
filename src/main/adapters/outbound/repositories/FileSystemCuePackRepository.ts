import { Result } from '../../../shared-kernel'
import {
  CuePack,
  ICuePackRepository,
  Cue,
  AudioFileName,
  CueObjective,
  CueTriggerType
} from '../../../hexagon'
import path from 'path'
import fs from 'fs/promises'

export class FileSystemCuePackRepository implements ICuePackRepository {
  private readonly _path: string

  private constructor(_basePath: string) {
    this._path = _basePath
  }

  private async readCuePacks(): Promise<FSCuePack[]> {
    try {
      const data = await fs.readFile(this._path, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  private async writeCuePacks(cuePacks: FSCuePack[]): Promise<void> {
    await fs.writeFile(this._path, JSON.stringify(cuePacks, null, 2))
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
      triggerType: cue.triggerType,
      interval: cue.interval,
      triggerAt: cue.triggerAt,
      event: cue.event,
      objective: cue.objective,
      beforeObjective: cue.beforeObjective
    }
  }

  private deserializeCuePack(fsCuePack: FSCuePack): CuePack {
    // Create a new CuePack with the stored name
    const cuePack = CuePack.create(fsCuePack.name)

    // Use Object.defineProperty to set the private properties
    Object.defineProperty(cuePack, 'id', { value: fsCuePack.id, writable: false })

    // Set the active state
    if (fsCuePack.isActive) {
      cuePack.activate()
    }

    // Add all the cues
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
      triggerType: fsCue.triggerType,
      interval: fsCue.interval,
      triggerAt: fsCue.triggerAt,
      event: fsCue.event,
      objective: fsCue.objective,
      beforeObjective: fsCue.beforeObjective
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

  public static async create(basePath: string): Promise<FileSystemCuePackRepository> {
    const filePath = path.join(basePath, 'cue-packs.json')

    await fs.mkdir(path.dirname(filePath), { recursive: true })

    try {
      await fs.access(filePath)
    } catch {
      await fs.writeFile(filePath, '[]')
    }

    return new FileSystemCuePackRepository(filePath)
  }
}

type FSCue = {
  id: string
  text: string
  audioUrl: {
    fileName: string
    extension: 'mp3' | 'wav'
    path: string
  }
  triggerType: CueTriggerType
  interval?: number
  triggerAt?: number
  event?: string
  objective?: CueObjective
  beforeObjective?: number
}

type FSCuePack = {
  id: string
  name: string
  isActive: boolean
  cues: FSCue[]
}
