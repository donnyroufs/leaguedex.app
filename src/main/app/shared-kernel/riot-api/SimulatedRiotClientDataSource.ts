import { LiveGameData } from './IRiotClientDataSource'
import { IEventBus } from '../EventBus'
import { GetGameDataResult, IRiotClientDataSource } from './IRiotClientDataSource'
import { Result } from '../Result'

type WriteableDeep<T> = {
  -readonly [P in keyof T]: T[P] extends object ? WriteableDeep<T[P]> : T[P]
}

export class SimulatedRiotClientDataSource implements IRiotClientDataSource {
  private _response: WriteableDeep<LiveGameData> | null = null

  private constructor() {
    //
  }

  public async getGameData(): Promise<GetGameDataResult> {
    if (this._response == null) {
      // TODO: match contract
      return Result.err(new Error('Game not started 404'))
    }

    return Result.ok(this._response)
  }

  public startGame(): void {
    this._response = SimulatedRiotClientDataSource.createSampleResponse()
  }

  public endGame(): void {
    this._response = null
  }

  public static create(
    eventBus: IEventBus,
    startDelay: number = 5_000,
    endTimer: number = 60
  ): IRiotClientDataSource {
    const source = new SimulatedRiotClientDataSource()

    setTimeout(() => {
      source.startGame()
    }, startDelay)

    // Simulate the first tick to be 1
    eventBus.subscribe('game-started', () => {
      source._response = SimulatedRiotClientDataSource.createSampleResponse(1)
    })

    eventBus.subscribe('game-tick', () => {
      if (source._response == null) {
        return
      }

      source._response.gameData.gameTime += 1

      if (source._response.gameData.gameTime >= endTimer) {
        source.endGame()
      }
    })

    return source
  }

  public static createSampleResponse(tick: number = 0): WriteableDeep<LiveGameData> {
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
        summonerName: 'Riot Tuxedo'
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
          summonerName: 'Riot Tuxedo',
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
        gameTime: tick,
        mapName: 'Map11',
        mapNumber: 11,
        mapTerrain: 'Default'
      }
    }
  }
}
