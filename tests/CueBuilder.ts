import { AudioFileName } from '@hexagon/AudioFileName'
import { Cue, CueObjective, CueTrigger } from '@hexagon/Cue'
import { FiringMode } from '@hexagon/triggers/FiringMode'
import { Predicate } from '@hexagon/triggers/Predicate'

export class CueBuilder {
  private _text: string = 'from-builder'
  private _trigger: CueTrigger = { kind: 'interval', seconds: 1000 }
  private _endTime?: number

  public withText(text: string): CueBuilder {
    this._text = text
    return this
  }

  public asInterval(seconds: number): CueBuilder {
    this._trigger = { kind: 'interval', seconds }
    return this
  }

  public asOneTime(at: number): CueBuilder {
    this._trigger = { kind: 'oneTime', at }
    return this
  }

  public asObjective(objective: CueObjective, secondsBefore: number): CueBuilder {
    this._trigger = { kind: 'objective', objective, secondsBefore }
    return this
  }

  public asPredicate(predicate: Predicate, firing: FiringMode = { mode: 'edge' }): CueBuilder {
    this._trigger = { kind: 'predicate', predicate, firing }
    return this
  }

  public asCanonWaveSpawned(): CueBuilder {
    this._trigger = { kind: 'builtIn', id: 'canon-wave-spawned' }
    return this
  }

  public asSupportItemUpgraded(): CueBuilder {
    this._trigger = { kind: 'builtIn', id: 'support-item-upgraded' }
    return this
  }

  public asManaChanged(value: number): CueBuilder {
    this._trigger = {
      kind: 'predicate',
      predicate: { op: 'cmp', field: 'activePlayer.currentMana', operator: '<=', value },
      firing: { mode: 'edgeWithCooldown', cooldownSeconds: 60 }
    }
    return this
  }

  public asGoldThreshold(value: number): CueBuilder {
    this._trigger = {
      kind: 'predicate',
      predicate: { op: 'cmp', field: 'activePlayer.currentGold', operator: '>=', value },
      firing: { mode: 'edgeWithCooldown', cooldownSeconds: 60 }
    }
    return this
  }

  public withEndTime(endTime: number): CueBuilder {
    this._endTime = endTime
    return this
  }

  public build(): Cue {
    return {
      id: crypto.randomUUID(),
      text: this._text,
      trigger: this._trigger,
      audioUrl: AudioFileName.createMP3(this._text),
      endTime: this._endTime
    }
  }
}
