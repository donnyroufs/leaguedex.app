import { GameEvent } from './GameEvent'
import { Team } from '../Team'

export class DragonKilledEvent extends GameEvent<{ gameTime: number; killedByTeam: Team }> {}
