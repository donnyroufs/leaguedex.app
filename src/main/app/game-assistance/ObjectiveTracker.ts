import { NormalizedGameEvent } from './IRiotClient'
import { objectivesConfig } from './ObjectivesConfig'
import { OneTimeReminder, Reminder } from './Reminder'
import { Seconds } from './types'

export class ObjectiveTracker {
  private _processedEvents: Set<number> = new Set()

  public track(gameEvents: NormalizedGameEvent[], gameTime: Seconds): Reminder[] {
    const events = this.getActualEvents(gameEvents)
    const reminders: Reminder[] = []

    reminders.push(...this.onKillEvents(events, gameTime))

    this.markEventsAsProcessed(gameEvents)

    return reminders
  }

  private onKillEvents(gameEvents: NormalizedGameEvent[], gameTime: Seconds): Reminder[] {
    const reminders: Reminder[] = []

    for (const evt of gameEvents) {
      const id = crypto.randomUUID()

      switch (evt.name) {
        case 'DragonKill':
          reminders.push(
            ...this.createReminder(
              id,
              objectivesConfig.dragon.firstSpawnTime,
              gameTime,
              objectivesConfig.dragon.name
            )
          )
          break
        case 'HeraldKill':
          break
        case 'BaronKill':
          reminders.push(
            ...this.createReminder(
              id,
              objectivesConfig.baron.firstSpawnTime,
              gameTime,
              objectivesConfig.baron.name
            )
          )
          break
      }
    }

    return reminders
  }

  private createReminder(
    id: string,
    triggerTime: Seconds,
    gameTime: Seconds,
    name: string
  ): Reminder[] {
    const offsets = [90, 60, 30]

    return offsets.map(
      (offset) =>
        new OneTimeReminder(
          id,
          `${name} will spawn in ${offset} seconds`,
          gameTime + (triggerTime - offset)
        )
    )
  }

  private getActualEvents(gameEvents: NormalizedGameEvent[]): NormalizedGameEvent[] {
    return gameEvents.filter((e) => !this._processedEvents.has(e.id))
  }

  private markEventsAsProcessed(gameEvents: NormalizedGameEvent[]): void {
    gameEvents.forEach((e) => this._processedEvents.add(e.id))
  }
}
