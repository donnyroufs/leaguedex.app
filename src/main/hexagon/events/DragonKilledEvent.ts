import { GameEvent } from './GameEvent'
import { Team } from '../Team'

export class DragonKilledEvent extends GameEvent<{ gameTime: number; killedByTeam: Team }> {
  public override readonly eventType = 'dragon-killed'

  public constructor(id: number, data: { gameTime: number; killedByTeam: Team }) {
    super(id, data)
  }
}
