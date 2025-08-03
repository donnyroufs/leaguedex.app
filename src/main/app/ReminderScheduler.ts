import { objectivesConfig } from './ObjectivesConfig'
import { OneTimeReminder, Reminder } from './Reminder'
import { Seconds } from './types'

export class ReminderScheduler {
  public static schedule(userReminders: Reminder[], gameTime: Seconds): Reminder[] {
    const reminders: Reminder[] = []
    const offsets = [90, 60, 30]

    for (const objective of Object.values(objectivesConfig)) {
      const timeUntilSpawn = objective.firstSpawnTime - gameTime

      if (timeUntilSpawn > 0) {
        const validOffsets = offsets.filter((offset) => offset < timeUntilSpawn)

        for (const reminderTime of validOffsets) {
          reminders.push(
            new OneTimeReminder(
              crypto.randomUUID(),
              `${objective.name} spawning in ${reminderTime} seconds`,
              objective.firstSpawnTime - reminderTime
            )
          )
        }
      }
    }

    return [...userReminders, ...reminders]
  }
}
