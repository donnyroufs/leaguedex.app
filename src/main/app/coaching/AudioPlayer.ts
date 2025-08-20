import { IAudioPlayer } from './IAudioPlayer'
import { Result } from '../shared-kernel'
import { ILogger } from '../shared-kernel/ILogger'
import soundPlay from 'sound-play'

export class AudioPlayer implements IAudioPlayer {
  public constructor(private readonly _logger: ILogger) {}

  public async play(audioPath: string): Promise<Result<void, Error>> {
    this._logger.info('Playing audio', {
      audioPath
    })

    try {
      await soundPlay.play(audioPath, 1)
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
