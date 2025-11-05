import { test, describe, expect, beforeEach } from 'vitest'
import { GameData } from '../src/main/hexagon'
import { GameStateAssembler } from '../src/main/hexagon/GameStateAssembler'

describe('GameStateAssembler', () => {
  let assembler: GameStateAssembler

  beforeEach(() => {
    assembler = new GameStateAssembler()
  })

  test('assembles the game state from the game data', () => {
    const data: GameData = {
      hasStarted: true,
      gameTime: 0,
      events: [],
      activePlayer: {
        summonerName: 'test#123',
        isAlive: true,
        respawnsIn: null,
        currentMana: null,
        totalMana: null,
        items: []
      }
    }

    const state = assembler.assemble(data)

    expect(state).not.toBeNull()
    expect(state!.gameTime).toBe(0)
    expect(state!.events).toEqual([])
    expect(state!.activePlayer.isAlive).toBe(true)
    expect(state!.activePlayer.summonerName).toBe('test#123')
    expect(state!.activePlayer.respawnsIn).toBeNull()
  })

  test('Tracks unprocessed events and never sends processed events', () => {
    const data1: GameData = {
      hasStarted: true,
      gameTime: 0,
      events: [
        {
          id: 1,
          data: {}
        }
      ],
      activePlayer: {
        summonerName: 'test#123',
        isAlive: true,
        respawnsIn: null,
        currentMana: null,
        totalMana: null,
        items: []
      }
    }

    const data2: GameData = {
      hasStarted: true,
      gameTime: 1,
      events: [
        {
          id: 1,
          data: {}
        },
        {
          id: 2,
          data: {}
        }
      ],
      activePlayer: {
        summonerName: 'test#123',
        isAlive: true,
        respawnsIn: null,
        currentMana: null,
        totalMana: null,
        items: []
      }
    }

    const state1 = assembler.assemble(data1)
    const state2 = assembler.assemble(data2)
    const state3 = assembler.assemble(data2)

    expect(state1!.events).toEqual([{ id: 1, data: {} }])
    expect(state2!.events).toEqual([{ id: 2, data: {} }])
    expect(state3!.events).toEqual([])
  })
})
