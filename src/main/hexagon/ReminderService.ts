import { CreateReminderDto, CreateReminderUseCase } from './CreateReminderUseCase'
import { GameTickEvent } from './domain-events'
import { GetRemindersUseCase } from './GetRemindersUseCase'
import { IAudioPlayer } from './ports/IAudioPlayer'
import { IEventBus } from './ports/IEventBus'
import { ILogger } from './ports/ILogger'
import { IReminderRepository } from './ports/IReminderRepository'
import { IReminderDto } from './ReminderDto'
import { ReminderEngine } from './ReminderEngine'
import { RemoveReminderUseCase } from './RemoveReminderUseCase'

export class ReminderService {
  public constructor(
    private readonly _createReminderUseCase: CreateReminderUseCase,
    private readonly _getRemindersUseCase: GetRemindersUseCase,
    private readonly _removeReminderUseCase: RemoveReminderUseCase,
    private readonly _eventBus: IEventBus,
    private readonly _audioPlayer: IAudioPlayer,
    private readonly _logger: ILogger,
    private readonly _reminderRepository: IReminderRepository
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
    const { gameTime } = evt.payload.state

    const reminders = await this._reminderRepository.all()
    const dueReminders = ReminderEngine.getDueReminders(evt.payload.state, reminders.unwrap())

    this._logger.info('Processing reminders', {
      gameTime,
      reminders: reminders.unwrap().map((x) => x.id),
      dueReminders: dueReminders.map((x) => x.id)
    })

    for (const reminder of dueReminders) {
      await this._audioPlayer.play(reminder.audioUrl)
    }
  }
}
