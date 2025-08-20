import { Result } from '../shared-kernel'

export interface IAudioPlayer {
  play(audioName: string): Promise<Result<void, Error>>
}
