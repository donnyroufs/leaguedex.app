import { GameState } from './GameState'
import { Reminder } from './Reminder'

export class ReminderEngine {
  public static getDueReminders(state: GameState, reminders: Reminder[]): Reminder[] {
    return reminders.filter((reminder) => {
      if (reminder.triggerType === 'interval' && reminder.interval) {
        return state.gameTime % reminder.interval === 0
      }

      if (reminder.triggerType === 'oneTime' && reminder.triggerAt) {
        return state.gameTime === reminder.triggerAt
      }

      if (reminder.triggerType === 'event' && reminder.event === 'respawn') {
        return state.activePlayer.respawnsIn === 1
      }

      if (reminder.triggerType === 'objective' && reminder.objective != null) {
        const nextSpawn = state.objectives[reminder.objective]?.nextSpawn

        if (!nextSpawn) {
          return false
        }

        return state.gameTime === nextSpawn - reminder.beforeObjective!
      }

      return false
    })
  }
}
