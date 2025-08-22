import { GameTickEvent } from './events/GameTickEvent'
import { GameObjectiveTracker } from './GameObjectiveTracker'
import { IAudioPlayer } from './ports/IAudioPlayer'
import { ILogger } from './ports/ILogger'
import { IReminderRepository } from './ports/IReminderRepository'

export class RemindersGameTickListener {
  public constructor(
    private readonly _reminderRepository: IReminderRepository,
    private readonly _audioPlayer: IAudioPlayer,
    private readonly _logger: ILogger,
    private readonly _gameObjectiveTracker: GameObjectiveTracker
  ) {}

  public async handle(evt: GameTickEvent): Promise<void> {
    const { gameTime } = evt.data.state

    // TODO: Should not be here but for now it's the easiest way
    this._gameObjectiveTracker.track(evt.data.state)

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

      if (reminder.triggerType === 'objective') {
        if (!reminder.objective) {
          return false
        }

        const nextSpawn = this._gameObjectiveTracker.getNextSpawn(reminder.objective)

        if (!nextSpawn) {
          return false
        }

        return gameTime === nextSpawn - reminder.beforeObjective!
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
