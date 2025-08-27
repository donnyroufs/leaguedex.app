import { GameEvent } from './GameEvent'

export class BaronKilledEvent extends GameEvent<{ gameTime: number }> {}
