import { GameTickEvent } from './domain-events/GameTickEvent'
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
    const { gameTime } = evt.payload.state

    const reminders = await this._reminderRepository.all()
    const dueReminders = reminders.unwrap().filter((reminder) => {
      if (reminder.triggerType === 'interval' && reminder.interval) {
        return gameTime % reminder.interval === 0
      }

      if (reminder.triggerType === 'oneTime' && reminder.triggerAt) {
        return gameTime === reminder.triggerAt
      }

      if (reminder.triggerType === 'event' && reminder.event === 'respawn') {
        return evt.payload.state.activePlayer.respawnsIn === 1
      }

      if (reminder.triggerType === 'objective' && reminder.objective != null) {
        const nextSpawn = evt.payload.state.objectives[reminder.objective]?.nextSpawn

        if (!nextSpawn) {
          return false
        }

        return gameTime === nextSpawn - reminder.beforeObjective!
      }

      return false
    })

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
