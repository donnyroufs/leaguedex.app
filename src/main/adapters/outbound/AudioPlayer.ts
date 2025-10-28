import { IAudioPlayer } from '../../hexagon'
import { Result } from '../../shared-kernel'
import { ILogger } from '../../hexagon'
import { soundPlay } from './SoundPlay'
import { join } from 'path'

export class AudioPlayer implements IAudioPlayer {
  public constructor(
    private readonly _logger: ILogger,
    private readonly _isProd: boolean
  ) {}

  public async play(audioPath: string, volume: number = 1): Promise<Result<void, Error>> {
    this._logger.info('Playing audio', {
      audioPath
    })

    try {
      if (!this._isProd) {
        await soundPlay.play(join(process.cwd(), 'dev-stub.wav'), volume)
      } else {
        await soundPlay.play(audioPath, volume)
      }
    } catch (err) {
      this._logger.error('Failed to play audio', {
        audioPath,
        error: err
      })
      return Result.err(err as Error)
    }

    return Result.ok(undefined)
  }
}
