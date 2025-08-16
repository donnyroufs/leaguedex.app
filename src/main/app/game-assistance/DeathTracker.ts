import { AllGameData } from './IRiotClient'
import { OneTimeReminder, Reminder } from './Reminder'
import { Seconds } from './types'

export class DeathTracker {
  private _processedEvents: Set<number> = new Set()

  public async track(gameData: AllGameData, gameTime: Seconds): Promise<Reminder[]> {
    const playerName = gameData.activePlayer.summonerName
    const player = gameData.allPlayers.find((p) => p.summonerName === playerName)
    const reminders: Reminder[] = []

    if (player == null) {
      throw new Error('Player not found')
    }

    const events = gameData.events.events.filter((e) => !this._processedEvents.has(e.eventID))

    for (const evt of events) {
      const id = crypto.randomUUID()

      switch (evt.eventName) {
        case 'ChampionKill':
          this._processedEvents.add(evt.eventID)
          reminders.push(
            new OneTimeReminder(id, 'What is our next objective?', gameTime + player.respawnTimer)
          )
          break
      }
    }

    return reminders
  }
}
