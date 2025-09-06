import {
  GetGameDataResult,
  IRiotClientDataSource,
  LiveGameData
} from '../src/main/adapters/outbound'
import { Result } from '../src/main/shared-kernel'

interface IGameTicker {
  tick(): Promise<void>
}

type WriteableDeep<T> = {
  -readonly [P in keyof T]: T[P] extends object ? WriteableDeep<T[P]> : T[P]
}

export class FakeRiotClientDataSource implements IRiotClientDataSource {
  private _state: WriteableDeep<LiveGameData> | null = this.createNewGameState()

  public async getGameData(): Promise<GetGameDataResult> {
    if (this._state === null) {
      return Result.err(new Error('Game not started'))
    }

    return Result.ok(this._state!)
  }

  public endGame(): void {
    this._state = null
  }

  public beforeMatchStart(): void {
    this._state = null
  }

  /**
   * Basically sets the game time to a given tick. An example of when to use this is
   * when you want to simulate starting the app when the game has already began.
   */
  public advanceToFutureTick(tick: number): void {
    if (this._state == null) {
      return
    }

    this._state!.gameData.gameTime = tick
  }

  public addGameStartedEvent(): void {
    this._state!.events.Events.push({
      EventID: 0, // Riot start ID is always 0 so we keep it 0
      EventName: 'GameStart',
      EventTime: 0
    })
  }

  // TODO: We need to add more data to figure out team
  public addDragonKilledEvent(deathTime: number): void {
    this._state!.events.Events.push({
      EventID: this.createUniqueEventId(),
      EventName: 'DragonKill',
      EventTime: deathTime,
      KillerName: 'test#1234',
      Assisters: []
    })
  }

  /**
   * A More generic method to add an objective death event
   */
  public addObjectiveDeathEvent(objective: string, deathTime: number): void {
    if (this._state == null) {
      return
    }

    switch (objective) {
      case 'dragon':
        this._state.events.Events.push({
          EventID: this.createUniqueEventId(),
          EventName: 'DragonKill',
          EventTime: deathTime,
          DragonType: 'TODO',
          KillerName: 'test#1234',
          Assisters: []
        })
        break
      case 'baron':
        this._state.events.Events.push({
          EventID: this.createUniqueEventId(),
          EventName: 'BaronKill',
          EventTime: deathTime
        })
        break
      default:
        throw new Error(`Unknown objective: ${objective}`)
    }
  }

  // TODO: we never update stats, should probably also add the kill event from Riot (whatever its called)
  public killPlayer(respawnTimer: number = 30, playerName: string = 'test#1234'): void {
    if (this._state == null) {
      throw new Error('Game not started')
    }

    const player = this._state!.allPlayers.find((p) => p.summonerName === playerName)

    if (!player) {
      throw new Error('Player not found')
    }

    player.isDead = true
    player.respawnTimer = respawnTimer
  }

  /**
   * @param ticker The ticker which will make sure that the clock is on sync with the game
   * this will ALWAYS be called AFTER the gameTime has been incremented to the next tick.
   */
  public async nextTick(ticker?: IGameTicker): Promise<void> {
    if (this._state == null) {
      return
    }

    this._state!.gameData.gameTime += 1
    await ticker?.tick()
  }

  public async tickMultipleTimes(ticker: IGameTicker, times: number): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.nextTick(ticker)
      this.onUpdate()
    }
  }

  public reset(): void {
    this._state = this.createNewGameState()
  }

  private onUpdate(): void {
    if (this._state == null) {
      return
    }

    if (this._state.allPlayers) {
      for (const player of this._state.allPlayers) {
        if (player.isDead && player.respawnTimer > 0) {
          player.respawnTimer = Math.max(0, player.respawnTimer - 1)
        }
      }
    }
  }

  private createNewGameState(): WriteableDeep<LiveGameData> {
    return {
      activePlayer: {
        abilities: {
          E: {
            abilityLevel: 0,
            displayName: 'Molten Shield',
            id: 'Annie',
            rawDescription: 'GeneratedTip_Spell_AnnieE_Description',
            rawDisplayName: 'GeneratedTip_Spell_AnnieE_DisplayName'
          },
          Passive: {
            displayName: 'Pyromania',
            id: 'AnniePassive',
            rawDescription: 'GeneratedTip_Passive_AnniePassive_Description',
            rawDisplayName: 'GeneratedTip_Passive_AnniePassive_DisplayName'
          },
          Q: {
            abilityLevel: 0,
            displayName: 'Disintegrate',
            id: 'AnnieQ',
            rawDescription: 'GeneratedTip_Spell_AnnieQ_Description',
            rawDisplayName: 'GeneratedTip_Spell_AnnieQ_DisplayName'
          },
          R: {
            abilityLevel: 0,
            displayName: 'Summon: Tibbers',
            id: 'AnnieR',
            rawDescription: 'GeneratedTip_Spell_AnnieR_Description',
            rawDisplayName: 'GeneratedTip_Spell_AnnieR_DisplayName'
          },
          W: {
            abilityLevel: 0,
            displayName: 'Incinerate',
            id: 'AnnieW',
            rawDescription: 'GeneratedTip_Spell_AnnieW_Description',
            rawDisplayName: 'GeneratedTip_Spell_AnnieW_DisplayName'
          }
        },
        championStats: {
          abilityPower: 0,
          armor: 0,
          armorPenetrationFlat: 0,
          armorPenetrationPercent: 0,
          attackDamage: 0,
          attackRange: 0,
          attackSpeed: 0,
          bonusArmorPenetrationPercent: 0,
          bonusMagicPenetrationPercent: 0,
          cooldownReduction: 0,
          critChance: 0,
          critDamage: 0,
          currentHealth: 0,
          healthRegenRate: 0,
          lifeSteal: 0,
          magicLethality: 0,
          magicPenetrationFlat: 0,
          magicPenetrationPercent: 0,
          magicResist: 0,
          maxHealth: 0,
          moveSpeed: 0,
          physicalLethality: 0,
          resourceMax: 0,
          resourceRegenRate: 0,
          resourceType: 'MANA',
          resourceValue: 0,
          spellVamp: 0,
          tenacity: 0
        },
        currentGold: 0,
        fullRunes: {
          generalRunes: [
            {
              displayName: 'Electrocute',
              id: 8112,
              rawDescription: 'perk_tooltip_Electrocute',
              rawDisplayName: 'perk_displayname_Electrocute'
            },
            {
              displayName: 'Cheap Shot',
              id: 8126,
              rawDescription: 'perk_tooltip_CheapShot',
              rawDisplayName: 'perk_displayname_CheapShot'
            },
            {
              displayName: 'Eyeball Collection',
              id: 8138,
              rawDescription: 'perk_tooltip_EyeballCollection',
              rawDisplayName: 'perk_displayname_EyeballCollection'
            },
            {
              displayName: 'Relentless Hunter',
              id: 8105,
              rawDescription: 'perk_tooltip_8105',
              rawDisplayName: 'perk_displayname_8105'
            },
            {
              displayName: 'Celerity',
              id: 8234,
              rawDescription: 'perk_tooltip_Celerity',
              rawDisplayName: 'perk_displayname_Celerity'
            },
            {
              displayName: 'Gathering Storm',
              id: 8236,
              rawDescription: 'perk_tooltip_GatheringStorm',
              rawDisplayName: 'perk_displayname_GatheringStorm'
            }
          ],
          keystone: {
            displayName: 'Electrocute',
            id: 8112,
            rawDescription: 'perk_tooltip_Electrocute',
            rawDisplayName: 'perk_displayname_Electrocute'
          },
          primaryRuneTree: {
            displayName: 'Domination',
            id: 8100,
            rawDescription: 'perkstyle_tooltip_7200',
            rawDisplayName: 'perkstyle_displayname_7200'
          },
          secondaryRuneTree: {
            displayName: 'Sorcery',
            id: 8200,
            rawDescription: 'perkstyle_tooltip_7202',
            rawDisplayName: 'perkstyle_displayname_7202'
          },
          statRunes: [
            {
              id: 5008,
              rawDescription: 'perk_tooltip_StatModAdaptive'
            },
            {
              id: 5003,
              rawDescription: 'perk_tooltip_StatModMagicResist'
            },
            {
              id: 5003,
              rawDescription: 'perk_tooltip_StatModMagicResist'
            }
          ]
        },
        level: 1,
        summonerName: 'test#1234'
      },
      allPlayers: [
        {
          summonerName: 'test#1234',
          team: 'CHAOS',
          championName: 'Annie',
          isBot: false,
          isDead: false,
          items: [],
          level: 1,
          position: '',
          rawChampionName: 'game_character_displayname_Annie',
          respawnTimer: 0,
          runes: {
            keystone: {
              displayName: 'Electrocute',
              id: 8112,
              rawDescription: 'perk_tooltip_Electrocute',
              rawDisplayName: 'perk_displayname_Electrocute'
            },
            primaryRuneTree: {
              displayName: 'Domination',
              id: 8100,
              rawDescription: 'perkstyle_tooltip_7200',
              rawDisplayName: 'perkstyle_displayname_7200'
            },
            secondaryRuneTree: {
              displayName: 'Sorcery',
              id: 8200,
              rawDescription: 'perkstyle_tooltip_7202',
              rawDisplayName: 'perkstyle_displayname_7202'
            }
          },
          scores: {
            assists: 0,
            creepScore: 0,
            deaths: 0,
            kills: 0,
            wardScore: 0
          },
          skinID: 0,
          summonerSpells: {
            summonerSpellOne: {
              displayName: 'Flash',
              rawDescription: 'GeneratedTip_SummonerSpell_SummonerFlash_Description',
              rawDisplayName: 'GeneratedTip_SummonerSpell_SummonerFlash_DisplayName'
            },
            summonerSpellTwo: {
              displayName: 'Ignite',
              rawDescription: 'GeneratedTip_SummonerSpell_SummonerDot_Description',
              rawDisplayName: 'GeneratedTip_SummonerSpell_SummonerDot_DisplayName'
            }
          }
        }
      ],
      events: { Events: [] },
      gameData: {
        gameMode: 'CLASSIC',
        gameTime: 0,
        mapName: 'Map11',
        mapNumber: 11,
        mapTerrain: 'Default'
      }
    }
  }

  private createUniqueEventId(): number {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000)
  }
}
