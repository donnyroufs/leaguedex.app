import { Matchup } from '../Matchup'
import { Seconds } from './types'

export interface IDispatcher {
  dispatch<TName extends keyof Contract>(name: TName, data: Contract[TName]): void
  subscribe<TName extends keyof Contract>(
    name: TName,
    callback: (data: Contract[TName]) => void
  ): void
}

export type Contract = {
  'game-data': {
    playing: boolean
    gameTime: Seconds | null
    matchup: Matchup | null
    insights: string | null
  }
}
