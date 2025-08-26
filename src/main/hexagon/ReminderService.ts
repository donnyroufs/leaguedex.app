import { CreateReminderDto, CreateReminderUseCase } from './CreateReminderUseCase'
import { GameTickEvent } from './domain-events'
import { GetRemindersUseCase } from './GetRemindersUseCase'
import { IEventBus } from './ports/IEventBus'
import { IReminderDto } from './ReminderDto'
import { RemindersGameTickListener } from './RemindersGameTickListener'
import { RemoveReminderUseCase } from './RemoveReminderUseCase'

export class ReminderService {
  public constructor(
    private readonly _createReminderUseCase: CreateReminderUseCase,
    private readonly _getRemindersUseCase: GetRemindersUseCase,
    private readonly _removeReminderUseCase: RemoveReminderUseCase,
    private readonly _remindersGameTickListener: RemindersGameTickListener,
    private readonly _eventBus: IEventBus
  ) {}

  public async start(): Promise<void> {
    this._eventBus.subscribe('game-tick', this.onGameTick.bind(this))
  }

  public async stop(): Promise<void> {
    this._eventBus.unsubscribe('game-tick', this.onGameTick.bind(this))
  }

  public async addReminder(data: CreateReminderDto): Promise<string> {
    return this._createReminderUseCase.execute(data)
  }

  public async getReminders(): Promise<IReminderDto[]> {
    return this._getRemindersUseCase.execute()
  }

  public async removeReminder(id: string): Promise<void> {
    return this._removeReminderUseCase.execute(id)
  }

  protected async onGameTick(evt: GameTickEvent): Promise<void> {
    return this._remindersGameTickListener.handle(evt)
  }
}
