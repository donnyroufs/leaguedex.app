import { Cue } from '@hexagon/Cue'
import { CuePack } from '@hexagon/CuePack'

export class TestCuePackBuilder {
  private _name: string = 'My Pack'
  private _isActive: boolean = false
  private _cues: Cue[] = []

  public withName(name: string): TestCuePackBuilder {
    this._name = name
    return this
  }

  public isActive(): TestCuePackBuilder {
    this._isActive = true
    return this
  }

  public withCues(cues: Cue[]): TestCuePackBuilder {
    this._cues = cues
    return this
  }

  public build(): CuePack {
    const pack = CuePack.create(this._name)

    if (this._isActive) {
      pack.activate()
    }

    this._cues.forEach((cue) => {
      pack.add(cue)
    })

    return pack
  }
}
