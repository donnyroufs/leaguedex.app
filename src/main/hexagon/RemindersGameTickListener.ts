import { GameTickEvent } from './domain-events/GameTickEvent'
import { IAudioPlayer } from './ports/IAudioPlayer'
import { ILogger } from './ports/ILogger'
import { IReminderRepository } from './ports/IReminderRepository'
import { ReminderEngine } from './ReminderEngine'

export class RemindersGameTickListener {
  public constructor(
    private readonly _reminderRepository: IReminderRepository,
    private readonly _audioPlayer: IAudioPlayer,
    private readonly _logger: ILogger
  ) {}

  public async handle(evt: GameTickEvent): Promise<void> {
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
