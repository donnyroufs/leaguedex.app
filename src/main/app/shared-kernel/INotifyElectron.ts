import { Contracts } from '.'

export interface INotifyElectron {
  notify(channel: 'game-data', data: Contracts.GameDataDto): void
}
