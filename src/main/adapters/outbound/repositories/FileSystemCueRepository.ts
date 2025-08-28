import path from 'path'
import fs from 'fs/promises'
import { Result } from '../../../shared-kernel'
import { AudioFileName, ICueRepository, Cue, CueObjective, CueTriggerType } from '../../../hexagon'

export class FileSystemCueRepository implements ICueRepository {
  private readonly _path: string

  private constructor(_basePath: string) {
    this._path = _basePath
  }

  public async save(cue: Cue): Promise<Result<void, Error>> {
    try {
      const cuesResult = await this.all()
      const cues = cuesResult.unwrap()

      cues.push(cue)
      await fs.writeFile(this._path, JSON.stringify(cues, null, 2))
      return Result.ok(undefined)
    } catch (err) {
      return Result.err(err as Error)
    }
  }

  public async all(): Promise<Result<Cue[], Error>> {
    try {
      const file = await fs.readFile(this._path, 'utf-8')
      const parsed = JSON.parse(file) as FSCue[]
      return Result.ok(
        parsed.map(
          (x: FSCue): Cue => ({
            ...x,
            audioUrl: AudioFileName.fromJSON(x.audioUrl)
          })
        )
      )
    } catch (err) {
      return Result.err(err as Error)
    }
  }

  public async remove(id: string): Promise<Result<void, Error>> {
    const cuesResult = await this.all()
    const cues = cuesResult.unwrap()

    const cue = cues.find((x) => x.id === id)

    if (!cue) {
      return Result.err(new Error('Cue not found'))
    }

    const filteredCues = cues.filter((x) => x.id !== id)
    await fs.writeFile(this._path, JSON.stringify(filteredCues, null, 2))
    return Result.ok(undefined)
  }

  public static async create(basePath: string): Promise<FileSystemCueRepository> {
    const filePath = path.join(basePath, 'cues.json')

    await fs.mkdir(path.dirname(filePath), { recursive: true })

    try {
      await fs.access(filePath)
    } catch {
      await fs.writeFile(filePath, '[]')
    }

    return new FileSystemCueRepository(filePath)
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
