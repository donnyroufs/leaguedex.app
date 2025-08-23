import { Contracts } from '../../shared-kernel'

export interface INotifyElectron {
  notify(channel: 'game-data', data: Contracts.GameDataDto): void
  notify(channel: 'play-audio', data: { audioPath: string }): void
}
