export interface IRiotClient {
  /**
   * GET https://127.0.0.1:2999/liveclientdata/allgamedata
   */
  getGameData(): Promise<AllGameData | null>

  /**
   * GET https://127.0.0.1:2999/liveclientdata/eventdata
   */
  getGameEvents(): Promise<NormalizedGameEvent[]>
}

export type GameEvent = {
  readonly EventID: 0
  readonly EventName: 'DragonKill' | 'HeraldKill' | 'BaronKill' | 'ChampionKill'
  readonly EventTime: 0
  readonly VictimName?: string
  readonly KillerName?: string
}

/**
 * This is the normalized game event. Coming from {@link GameEvent}
 */
export type NormalizedGameEvent = {
  readonly id: number
  readonly name: 'DragonKill' | 'HeraldKill' | 'BaronKill' | 'ChampionKill'
  readonly timeInSeconds: number
  readonly victimName?: string
  readonly killerName?: string
}

export type AllGameData = {
  readonly activePlayer: ActivePlayer
  readonly allPlayers: AllPlayer[]
  readonly events: Events
  readonly gameData: GameData
}

export type ActivePlayer = {
  readonly abilities: Abilities
  readonly championStats: ChampionStats
  readonly currentGold: number
  readonly fullRunes: FullRunes
  readonly level: number
  readonly summonerName: string
}

export type Abilities = {
  readonly e: E
  readonly passive: E
  readonly q: E
  readonly r: E
  readonly w: E
}

export type E = {
  readonly abilityLevel?: number
  readonly displayName: string
  readonly id?: string
  readonly rawDescription: string
  readonly rawDisplayName: string
}

export type ChampionStats = {
  readonly abilityPower: number
  readonly armor: number
  readonly armorPenetrationFlat: number
  readonly armorPenetrationPercent: number
  readonly attackDamage: number
  readonly attackRange: number
  readonly attackSpeed: number
  readonly bonusArmorPenetrationPercent: number
  readonly bonusMagicPenetrationPercent: number
  readonly cooldownReduction: number
  readonly critChance: number
  readonly critDamage: number
  readonly currentHealth: number
  readonly healthRegenRate: number
  readonly lifeSteal: number
  readonly magicLethality: number
  readonly magicPenetrationFlat: number
  readonly magicPenetrationPercent: number
  readonly magicResist: number
  readonly maxHealth: number
  readonly moveSpeed: number
  readonly physicalLethality: number
  readonly resourceMax: number
  readonly resourceRegenRate: number
  readonly resourceType: string
  readonly resourceValue: number
  readonly spellVamp: number
  readonly tenacity: number
}

export type FullRunes = {
  readonly generalRunes: Keystone[]
  readonly keystone: Keystone
  readonly primaryRuneTree: Keystone
  readonly secondaryRuneTree: Keystone
  readonly statRunes: StatRune[]
}

export type Keystone = {
  readonly displayName: string
  readonly id: number
  readonly rawDescription: string
  readonly rawDisplayName: string
}

export type StatRune = {
  readonly id: number
  readonly rawDescription: string
}

export type AllPlayer = {
  readonly championName: string
  readonly isBot: boolean
  readonly isDead: boolean
  readonly items: never[]
  readonly level: number
  readonly position: string
  readonly rawChampionName: string
  readonly respawnTimer: number
  readonly runes: Runes
  readonly scores: Scores
  readonly skinID: number
  readonly summonerName: string
  readonly summonerSpells: SummonerSpells
  readonly team: string
}

export type Runes = {
  readonly keystone: Keystone
  readonly primaryRuneTree: Keystone
  readonly secondaryRuneTree: Keystone
}

export type Scores = {
  readonly assists: number
  readonly creepScore: number
  readonly deaths: number
  readonly kills: number
  readonly wardScore: number
}

export type SummonerSpells = {
  readonly summonerSpellOne: E
  readonly summonerSpellTwo: E
}

export type Events = {
  readonly events: Event[]
}

export type Event = {
  readonly eventID: number
  readonly eventName: string
  readonly eventTime: number
}

export type GameData = {
  readonly gameMode: string
  /**
   * The time in seconds since the game started
   */
  readonly gameTime: number
  readonly mapName: string
  readonly mapNumber: number
  readonly mapTerrain: string
}
