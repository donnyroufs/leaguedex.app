import { Result } from '../../shared-kernel'

export interface IAudioPlayer {
  play(audioName: string, volume?: number): Promise<Result<void, Error>>
}
