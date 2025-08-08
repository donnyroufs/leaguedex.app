import { AllGameData } from './game-assistance/IRiotClient'

type Champion = {
  team: 'blue' | 'red' | 'unknown'
  championName: string
  role: 'top' | 'jungle' | 'middle' | 'bottom' | 'utility' | 'unknown'
}

export type Matchup = {
  you: Champion
  enemy: Champion
}

export class MatchupService {
  public static getMatchup(data: AllGameData): Matchup {
    const summonerName = data.activePlayer.summonerName
    const you = data.allPlayers.find((x) => x.summonerName === summonerName)

    if (!you) {
      throw new Error('You are not in the game')
    }

    const enemy = data.allPlayers.find((x) => x.position === you.position && x.team !== you.team)

    if (!enemy) {
      throw new Error('No enemy found')
    }

    return {
      you: {
        team: this.getTeam(you.team),
        championName: you.championName,
        role: this.getRole(you.position)
      },
      enemy: {
        team: this.getTeam(enemy.team),
        championName: enemy.championName,
        role: this.getRole(enemy.position)
      }
    }
  }

  /**
   * @param team - CHAOS or ORDER
   */
  private static getTeam(team: string): 'blue' | 'red' | 'unknown' {
    switch (team.toLowerCase()) {
      case 'chaos':
        return 'red'
      case 'order':
        return 'blue'
      default:
        return 'unknown'
    }
  }

  private static getRole(
    role: string
  ): 'top' | 'jungle' | 'middle' | 'bottom' | 'utility' | 'unknown' {
    switch (role.toLowerCase()) {
      case 'top':
        return 'top'
      case 'jungle':
        return 'jungle'
      case 'middle':
        return 'middle'
      case 'bottom':
        return 'bottom'
      case 'utility':
        return 'utility'
      default:
        return 'unknown'
    }
  }
}
