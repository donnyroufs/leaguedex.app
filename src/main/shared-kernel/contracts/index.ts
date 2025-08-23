export type GameDataDto = {
  type: 'game-data'
  started: boolean
  time: number | null
}

export function createGameDataDto(started: boolean, time: number | null): GameDataDto {
  return {
    type: 'game-data',
    started,
    time
  }
}
