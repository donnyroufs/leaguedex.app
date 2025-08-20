import { GameTickEvent } from './events/GameTickEvent'
import { IAudioPlayer } from './ports/IAudioPlayer'
import { ILogger } from './ports/ILogger'
import { IReminderRepository } from './ports/IReminderRepository'

export class RemindersGameTickListener {
  public constructor(
    private readonly _reminderRepository: IReminderRepository,
    private readonly _audioPlayer: IAudioPlayer,
    private readonly _logger: ILogger
  ) {}

  public async handle(evt: GameTickEvent): Promise<void> {
    const reminders = await this._reminderRepository.all()
    const dueReminders = reminders.unwrap().filter((reminder) => {
      if (reminder.triggerType === 'interval' && reminder.interval) {
        return evt.data.gameTime % reminder.interval === 0
      }

      if (reminder.triggerType === 'oneTime' && reminder.triggerAt) {
        return evt.data.gameTime === reminder.triggerAt
      }

      return false
    })

    this._logger.info('Processing reminders', {
      gameTime: evt.data.gameTime,
      dueRemindersLen: dueReminders.length
    })

    for (const reminder of dueReminders) {
      await this._audioPlayer.play(reminder.audioUrl)
    }
  }
}
