import { NormalizedGameEvent } from './IRiotClient'
import { OneTimeReminder, Reminder } from './Reminder'
import { DebugLogger } from './DebugLogger'

export class ReminderScheduler {
  public static schedule(gameEvents: NormalizedGameEvent[], userReminders: Reminder[]): Reminder[] {
    DebugLogger.info('ReminderScheduler.schedule() called', {
      gameEventsCount: gameEvents.length,
      userRemindersCount: userReminders.length
    })

    const reminders: Reminder[] = []

    // TODO: move to some kind of config file so that we do not needto alter source code
    // This should also come with enable/disable functionality not everyone wants all of these
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
        respawnTimer: null,
        firstSpawnTime: 900, // 15 minutes
        doesRespawn: false
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
      DebugLogger.log('No game events, adding initial spawn reminders')
      // Add initial spawn reminders when no events have occurred yet
      for (const objective of Object.values(objectiveTimers)) {
        const reminderTimes = [90, 60, 30]

        for (const reminderTime of reminderTimes) {
          if (objective.firstSpawnTime > reminderTime) {
            const reminder = new OneTimeReminder(
              crypto.randomUUID(),
              `${objective.name} spawning in ${reminderTime} seconds`,
              false,
              objective.firstSpawnTime - reminderTime
            )
            reminders.push(reminder)
            DebugLogger.log('Added initial spawn reminder', {
              objective: objective.name,
              reminderTime,
              triggerTime: objective.firstSpawnTime - reminderTime
            })
          }
        }
      }
    }

    if (gameEvents.length > 0) {
      DebugLogger.log('Processing game events for reminder scheduling')
      for (const gameEvent of gameEvents) {
        DebugLogger.log('Processing game event', {
          eventName: gameEvent.name,
          timeInSeconds: gameEvent.timeInSeconds
        })

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
              const reminder = new OneTimeReminder(
                crypto.randomUUID(),
                `${objectiveTimer.name} spawning in ${reminderTime} seconds`,
                false,
                nextSpawnTime - reminderTime
              )
              reminders.push(reminder)
              DebugLogger.log('Added respawn reminder', {
                objective: objectiveTimer.name,
                reminderTime,
                triggerTime: nextSpawnTime - reminderTime,
                nextSpawnTime,
                currentTime
              })
            }
          }
        } else {
          DebugLogger.warn('No objective timer found for game event', { eventName: gameEvent.name })
        }
      }
    }

    const turretPlateReminderTimes = [90, 60, 30]
    for (const reminderTime of turretPlateReminderTimes) {
      const reminder = new OneTimeReminder(
        crypto.randomUUID(),
        `Turret plates falling in ${reminderTime} seconds`,
        false,
        840 - reminderTime
      )
      reminders.push(reminder)
      DebugLogger.log('Added turret plate reminder', {
        reminderTime,
        triggerTime: 840 - reminderTime
      })
    }

    const totalReminders = [...userReminders, ...reminders]
    DebugLogger.log('ReminderScheduler.schedule() completed', {
      totalReminders: totalReminders.length,
      userReminders: userReminders.length,
      scheduledReminders: reminders.length
    })

    // Return all reminders (user reminders first, then objective reminders)
    return totalReminders
  }
}
