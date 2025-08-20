import { IReminderDto } from './hexagon'
import { IEventBus, GameTickEvent, GameStartedEvent } from './hexagon'
import { createGameDataDto } from './shared-kernel/contracts'
import { GameDetectionService } from './hexagon'
import { ILogger } from './hexagon'
import { INotifyElectron } from './hexagon'
import { CreateReminderDto } from './hexagon'
import { CreateReminderUseCase } from './hexagon'
import { GetRemindersUseCase } from './hexagon'
import { RemindersGameTickListener } from './hexagon'

export class App {
  public constructor(
    private readonly _gameDetectionService: GameDetectionService,
    private readonly _eventBus: IEventBus,
    private readonly _notifyElectron: INotifyElectron,
    private readonly _logger: ILogger,
    private readonly _createReminderUseCase: CreateReminderUseCase,
    private readonly _getRemindersUseCase: GetRemindersUseCase,
    private readonly _remindersGameTickListener: RemindersGameTickListener
  ) {}

  public async start(): Promise<void> {
    this._eventBus.subscribe('game-started', this.onGameStarted.bind(this))
    this._eventBus.subscribe('game-ended', this.onGameEnded.bind(this))
    this._eventBus.subscribe('game-tick', this.onGameTick.bind(this))

    this._gameDetectionService.start()

    this._logger.info('app started')
  }

  public async stop(): Promise<void> {
    this._eventBus.unsubscribe('game-started', this.onGameStarted.bind(this))
    this._eventBus.unsubscribe('game-ended', this.onGameEnded.bind(this))

    this._gameDetectionService.stop()
    this._logger.info('app stopped')
  }

  public getReminders(): Promise<IReminderDto[]> {
    this._logger.info('getReminders')
    return this._getRemindersUseCase.execute()
  }

  public async addReminder(data: CreateReminderDto): Promise<string> {
    this._logger.info('addReminder', { data })
    return this._createReminderUseCase.execute(data)
  }

  private async onGameStarted(evt: GameStartedEvent): Promise<void> {
    this._logger.info('onGameStarted')
    const data = createGameDataDto(true, evt.data.gameTime)
    this._notifyElectron.notify(data.type, data)
  }

  private async onGameEnded(): Promise<void> {
    this._logger.info('onGameEnded')
    const data = createGameDataDto(false, null)
    this._notifyElectron.notify(data.type, data)
  }

  private async onGameTick(evt: GameTickEvent): Promise<void> {
    this._logger.info('onGameTick')
    const data = createGameDataDto(true, evt.data.gameTime)
    this._notifyElectron.notify(data.type, data)

    await this._remindersGameTickListener.handle(evt)
  }
}
