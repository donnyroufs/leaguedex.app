import { GameEvent } from './GameEvent'

export class BaronKilledEvent extends GameEvent<{ gameTime: number }> {
  public override readonly eventType = 'baron-killed'

  public constructor(id: number, data: { gameTime: number }) {
    super(id, data)
  }
}
