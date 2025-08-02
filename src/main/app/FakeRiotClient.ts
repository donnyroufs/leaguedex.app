import { AllGameData, IRiotClient } from './IRiotClient'

export class FakeRiotClient implements IRiotClient {
  public async getGameData(): Promise<AllGameData> {
    return {
      activePlayer: {
        abilities: {
          e: {
            abilityLevel: 1,
            displayName: 'Fake E',
            id: 'e',
            rawDescription: 'Fake E description',
            rawDisplayName: 'Fake E Raw'
          },
          passive: {
            displayName: 'Fake Passive',
            id: 'passive',
            rawDescription: 'Fake passive description',
            rawDisplayName: 'Fake Passive Raw'
          },
          q: {
            abilityLevel: 1,
            displayName: 'Fake Q',
            id: 'q',
            rawDescription: 'Fake Q description',
            rawDisplayName: 'Fake Q Raw'
          },
          r: {
            abilityLevel: 1,
            displayName: 'Fake R',
            id: 'r',
            rawDescription: 'Fake R description',
            rawDisplayName: 'Fake R Raw'
          },
          w: {
            abilityLevel: 1,
            displayName: 'Fake W',
            id: 'w',
            rawDescription: 'Fake W description',
            rawDisplayName: 'Fake W Raw'
          }
        },
        championStats: {
          abilityPower: 0,
          armor: 30,
          armorPenetrationFlat: 0,
          armorPenetrationPercent: 0,
          attackDamage: 65,
          attackRange: 550,
          attackSpeed: 0.625,
          bonusArmorPenetrationPercent: 0,
          bonusMagicPenetrationPercent: 0,
          cooldownReduction: 0,
          critChance: 0,
          critDamage: 200,
          currentHealth: 500,
          healthRegenRate: 5,
          lifeSteal: 0,
          magicLethality: 0,
          magicPenetrationFlat: 0,
          magicPenetrationPercent: 0,
          magicResist: 30,
          maxHealth: 500,
          moveSpeed: 325,
          physicalLethality: 0,
          resourceMax: 100,
          resourceRegenRate: 5,
          resourceType: 'Mana',
          resourceValue: 100,
          spellVamp: 0,
          tenacity: 0
        },
        currentGold: 500,
        fullRunes: {
          generalRunes: [
            {
              displayName: 'Fake Rune',
              id: 1,
              rawDescription: 'Fake Rune Description',
              rawDisplayName: 'Fake Rune Raw'
            }
          ],
          keystone: {
            displayName: 'Fake Keystone',
            id: 2,
            rawDescription: 'Fake Keystone Description',
            rawDisplayName: 'Fake Keystone Raw'
          },
          primaryRuneTree: {
            displayName: 'Fake Primary',
            id: 3,
            rawDescription: 'Fake Primary Description',
            rawDisplayName: 'Fake Primary Raw'
          },
          secondaryRuneTree: {
            displayName: 'Fake Secondary',
            id: 4,
            rawDescription: 'Fake Secondary Description',
            rawDisplayName: 'Fake Secondary Raw'
          },
          statRunes: [
            {
              id: 5,
              rawDescription: 'Fake Stat'
            }
          ]
        },
        level: 1,
        summonerName: 'Fake Summoner'
      },
      allPlayers: [
        {
          championName: 'Fake Champion',
          isBot: false,
          isDead: false,
          items: [],
          level: 1,
          position: 'MIDDLE',
          rawChampionName: 'FakeChampion',
          respawnTimer: 0,
          runes: {
            keystone: {
              displayName: 'Player Keystone',
              id: 1,
              rawDescription: 'Player Keystone Description',
              rawDisplayName: 'Player Keystone Raw'
            },
            primaryRuneTree: {
              displayName: 'Player Primary',
              id: 2,
              rawDescription: 'Player Primary Description',
              rawDisplayName: 'Player Primary Raw'
            },
            secondaryRuneTree: {
              displayName: 'Player Secondary',
              id: 3,
              rawDescription: 'Player Secondary Description',
              rawDisplayName: 'Player Secondary Raw'
            }
          },
          scores: {
            assists: 0,
            creepScore: 0,
            deaths: 0,
            kills: 0,
            wardScore: 0
          },
          skinID: 1,
          summonerName: 'Player 1',
          summonerSpells: {
            summonerSpellOne: {
              displayName: 'Flash',
              rawDescription: 'Teleports champion',
              rawDisplayName: 'Flash'
            },
            summonerSpellTwo: {
              displayName: 'Ignite',
              rawDescription: 'Deals true damage',
              rawDisplayName: 'Ignite'
            }
          },
          team: 'ORDER'
        }
      ],
      events: {
        events: [
          {
            eventID: 1,
            eventName: 'GameStart',
            eventTime: 0
          }
        ]
      },
      gameData: {
        gameMode: 'CLASSIC',
        gameTime: 0,
        mapName: "Summoner's Rift",
        mapNumber: 11,
        mapTerrain: 'Default'
      }
    }
  }
}
