import { NormalizedGameEvent } from './IRiotClient'
import { objectivesConfig } from './ObjectivesConfig'
import { Reminder } from './Reminder'
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
            new Reminder(
              crypto.randomUUID(),
              `${objective.name} spawning in ${reminderTime} seconds`,
              objective.firstSpawnTime - reminderTime,
              true
            )
          )
        }
      }
    }

    if (gameTime < 840) {
      for (const reminderTime of offsets) {
        reminders.push(
          new Reminder(
            crypto.randomUUID(),
            `Turret plates falling in ${reminderTime} seconds`,
            840 - reminderTime,
            true
          )
        )
      }
    }

    return [...userReminders, ...reminders]
  }
}
