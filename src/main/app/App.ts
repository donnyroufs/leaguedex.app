import { CoachingModule } from './coaching'
import { GameStartedEvent, GameTickEvent, IEventBus } from './shared-kernel'
import { createGameDataDto } from './shared-kernel/contracts'
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
    const data = createGameDataDto(true, evt.data.gameTime)
    this._notifyElectron.notify(data.type, data)
    console.log(value)
  }

  private async onGameEnded(): Promise<void> {
    const result = await this._coachingModule.dispose()
    const value = result.unwrap()
    const data = createGameDataDto(false, null)
    this._notifyElectron.notify(data.type, data)
    console.log(value)
  }

  private onGameTick(evt: GameTickEvent): void {
    const data = createGameDataDto(true, evt.data.gameTime)
    this._notifyElectron.notify(data.type, data)
  }
}
