import { Result } from '../../../shared-kernel'
import { LiveGameData } from './IRiotClientDataSource'
import { GetGameDataResult, IRiotClientDataSource } from './IRiotClientDataSource'

type WriteableDeep<T> = {
  -readonly [P in keyof T]: T[P] extends object ? WriteableDeep<T[P]> : T[P]
}

export class SimulatedRiotClientDataSource implements IRiotClientDataSource {
  private _response: WriteableDeep<LiveGameData> | Error | null = null

  public constructor(
    private readonly _endTimer: number,
    private _startTimer: number,
    private readonly _simulateGameTime: boolean = false
  ) {}

  public async getGameData(): Promise<GetGameDataResult> {
    // TODO: match contract
    if (this._response == null) {
      return Result.err(new Error('Game not started 404'))
    }

    if (this._response instanceof Error) {
      return Result.err(this._response)
    }

    if (this._simulateGameTime) {
      this._response.gameData.gameTime += 1
    }

    return Result.ok(this._response)
  }

  public simulateObjectiveDeath(objective: string, deathTime: number): void {
    if (this._response == null) {
      throw new Error('Game not started')
    }

    if (this._response instanceof Error) {
      throw this._response
    }

    switch (objective) {
      case 'dragon':
        this._response.events.Events.push({
          EventID: this.generateEventId(),
          EventName: 'DragonKill',
          EventTime: deathTime,
          KillerName: 'test',
          Assisters: []
        })
        break
      case 'baron':
        this._response.events.Events.push({
          EventID: this.generateEventId(),
          EventName: 'BaronKill',
          EventTime: deathTime
        })
        break
      default:
        throw new Error(`Unknown objective: ${objective}`)
    }
  }

  public startGame(): void {
    this._response = this.createSampleResponse()
  }

  public endGame(): void {
    this._response = null
  }

  private createSampleResponse(): WriteableDeep<LiveGameData> {
    return {
      activePlayer: {
        abilities: {
          E: {
            abilityLevel: 0,
            displayName: 'Molten Shield',
            id: 'AnnieE',
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
          summonerName: 'test#1234',
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
          },
          team: 'ORDER'
        }
      ],
      events: {
        Events: [
          {
            EventID: 0,
            EventName: 'GameStart',
            EventTime: 0.0000000023
          }
        ]
      },
      gameData: {
        gameMode: 'CLASSIC',
        gameTime: this._startTimer,
        mapName: 'Map11',
        mapNumber: 11,
        mapTerrain: 'Default'
      }
    }
  }

  public simulateError(): void {
    this._response = new Error('Game ended')
  }

  public simulateNull(): void {
    this._response = null
  }

  public simulatePlayerDeath(respawnTimer: number): void {
    if (this._response == null) {
      throw new Error('Game not started')
    }

    if (this._response instanceof Error) {
      throw this._response
    }

    const name = this._response.activePlayer.summonerName
    const player = this._response.allPlayers.find((p) => p.summonerName === name)

    if (!player) {
      throw new Error('Player not found')
    }

    player.isDead = true
    player.respawnTimer = respawnTimer
  }

  public nextTick(): void {
    if (this._response == null) {
      return
    }

    if (this._response instanceof Error) {
      throw this._response
    }

    this._response.gameData.gameTime += 1

    // if (this._response.gameData.gameTime === 20) {
    //   this.simulatePlayerDeath(30)
    // }

    // Handle respawn timers
    if (this._response.allPlayers) {
      for (const player of this._response.allPlayers) {
        if (player.isDead && player.respawnTimer > 0) {
          player.respawnTimer = Math.max(0, player.respawnTimer - 1)
        }
      }
    }

    if (this._response.gameData.gameTime >= this._endTimer) {
      this.endGame()
    }
  }

  public setGameStarted(gameTime: number = 0): void {
    this._startTimer = gameTime
    this._response = this.createSampleResponse()
  }

  public static createAndStartGame(
    endTimer: number,
    startTimer: number = 0,
    simulateGameTime: boolean = false
  ): IRiotClientDataSource {
    const source = new SimulatedRiotClientDataSource(endTimer, startTimer, simulateGameTime)
    source.startGame()
    return source
  }

  public gameStateWithoutEvents(): void {
    const resp = this.createSampleResponse()
    resp.events.Events = []
    this._response = resp
  }

  public static createForTests(
    endTimer: number = 99999,
    startTimer: number = 0
  ): SimulatedRiotClientDataSource {
    const source = new SimulatedRiotClientDataSource(endTimer, startTimer)
    return source
  }

  private generateEventId(): number {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000)
  }
}
