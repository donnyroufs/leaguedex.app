import { GameEvent } from './GameEvent'

export class DragonKilledEvent extends GameEvent<{ gameTime: number }> {
  public override readonly eventType = 'dragon-killed'

  public constructor(id: number, data: { gameTime: number }) {
    super(id, data)
  }
}
