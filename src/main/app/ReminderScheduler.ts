import { NormalizedGameEvent } from './IRiotClient'
import { OneTimeReminder, Reminder } from './Reminder'

export class ReminderScheduler {
  public static schedule(gameEvents: NormalizedGameEvent[], userReminders: Reminder[]): Reminder[] {
    const reminders: Reminder[] = []

    // TODO: move to centralized location that we can change
    const objectiveTimers = {
      DragonKill: {
        name: 'Dragon',
        respawnTimer: 300, // 5 minutes
        firstSpawnTime: 300, // 5 minutes
        doesRespawn: true
      },
      BaronKill: {
        name: 'Baron',
        respawnTimer: 360, // 6 minutes
        firstSpawnTime: 1500, // 25 minutes
        doesRespawn: true
      },
      HeraldKill: {
        name: 'Herald',
        respawnTimer: 360, // 6 minutes for second herald
        firstSpawnTime: 480, // 8 minutes
        doesRespawn: true // First herald only respawns once
      },
      VoidGrubs: {
        name: 'Void Grubs',
        respawnTimer: null,
        firstSpawnTime: 480, // 8 minutes
        doesRespawn: false
      },
      Atakhan: {
        name: 'Atakhan',
        respawnTimer: null,
        firstSpawnTime: 1200, // 20 minutes
        doesRespawn: false
      }
    }

    if (gameEvents.length === 0) {
      // Add initial spawn reminders when no events have occurred yet
      for (const objective of Object.values(objectiveTimers)) {
        const reminderTimes = [90, 60, 30]

        for (const reminderTime of reminderTimes) {
          if (objective.firstSpawnTime > reminderTime) {
            reminders.push(
              new OneTimeReminder(
                crypto.randomUUID(),
                `${objective.name} spawning in ${reminderTime} seconds`,
                false,
                objective.firstSpawnTime - reminderTime
              )
            )
          }
        }
      }
    }

    if (gameEvents.length > 0) {
      for (const gameEvent of gameEvents) {
        const currentTime = gameEvent.timeInSeconds
        const objectiveTimer = objectiveTimers[gameEvent.name]

        if (objectiveTimer) {
          let nextSpawnTime = currentTime

          if (currentTime < objectiveTimer.firstSpawnTime) {
            nextSpawnTime = objectiveTimer.firstSpawnTime
          } else if (objectiveTimer.doesRespawn && objectiveTimer.respawnTimer) {
            nextSpawnTime = currentTime + objectiveTimer.respawnTimer
          }

          const reminderTimes = [90, 60, 30]

          for (const reminderTime of reminderTimes) {
            if (nextSpawnTime - currentTime > reminderTime) {
              reminders.push(
                new OneTimeReminder(
                  crypto.randomUUID(),
                  `${objectiveTimer.name} spawning in ${reminderTime} seconds`,
                  false,
                  nextSpawnTime - reminderTime
                )
              )
            }
          }
        }
      }
    }

    const turretPlateReminderTimes = [90, 60, 30]
    for (const reminderTime of turretPlateReminderTimes) {
      reminders.push(
        new OneTimeReminder(
          crypto.randomUUID(),
          `Turret plates falling in ${reminderTime} seconds`,
          false,
          840 - reminderTime
        )
      )
    }

    // Return all reminders (user reminders first, then objective reminders)
    return [...userReminders, ...reminders]
  }
}
