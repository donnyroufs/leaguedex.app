import { CoachingModule } from './coaching'
import {
  GameEndedEvent,
  GameStartedEvent,
  GameTickEvent,
  IEventBus
} from './shared-kernel/EventBus'
import { GameDetectionService } from './shared-kernel/game-detection/GameDetectionService'
import { INotifyElectron } from './shared-kernel/INotifyElectron'

export class App {
  public constructor(
    private readonly _coachingModule: CoachingModule,
    private readonly _gameDetectionService: GameDetectionService,
    private readonly _eventBus: IEventBus,
    private readonly _notifyElectron: INotifyElectron
  ) {}

  public async start(): Promise<void> {
    this._eventBus.subscribe('game-started', this.onGameStarted.bind(this))
    this._eventBus.subscribe('game-ended', this.onGameEnded.bind(this))
    this._eventBus.subscribe('game-tick', this.onGameTick.bind(this))

    this._gameDetectionService.start()
  }

  public async stop(): Promise<void> {
    this._eventBus.unsubscribe('game-started', this.onGameStarted.bind(this))
    this._eventBus.unsubscribe('game-ended', this.onGameEnded.bind(this))

    this._gameDetectionService.stop()
  }

  private async onGameStarted(evt: GameStartedEvent): Promise<void> {
    const result = await this._coachingModule.init()
    const value = result.unwrap()
    this._notifyElectron.notify('game-data', this.createData(evt.gameTick))
    console.log(value)
  }

  private async onGameEnded(evt: GameEndedEvent): Promise<void> {
    const result = await this._coachingModule.dispose()
    const value = result.unwrap()
    this._notifyElectron.notify('game-data', this.createData(evt.gameTick))
    console.log(value)
  }

  private onGameTick(evt: GameTickEvent): void {
    this._notifyElectron.notify('game-data', this.createData(evt.gameTick))
  }

  // TODO: type safe, we need to define contracts and see how to share this accordingly with renderer.
  private createData(gameTick: number): unknown {
    return {
      playing: true,
      gameTime: gameTick,
      matchup: null,
      insights: null,
      totalPlayed: 0,
      lastPlayed: null
    }
  }
}
