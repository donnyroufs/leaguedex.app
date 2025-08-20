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
    const { gameTime } = evt.data.state

    const reminders = await this._reminderRepository.all()
    const dueReminders = reminders.unwrap().filter((reminder) => {
      if (reminder.triggerType === 'interval' && reminder.interval) {
        return gameTime % reminder.interval === 0
      }

      if (reminder.triggerType === 'oneTime' && reminder.triggerAt) {
        return gameTime === reminder.triggerAt
      }

      if (reminder.triggerType === 'event' && reminder.event === 'respawn') {
        return evt.data.state.activePlayer.respawnsIn === 1
      }

      return false
    })

    this._logger.info('Processing reminders', {
      gameTime,
      dueRemindersLen: dueReminders.length
    })

    for (const reminder of dueReminders) {
      await this._audioPlayer.play(reminder.audioUrl)
    }
  }
}
