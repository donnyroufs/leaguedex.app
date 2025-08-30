import { CuePack } from '@hexagon/CuePack'

export class TestCuePackBuilder {
  private _name: string = 'My Pack'
  private _isActive: boolean = false

  public withName(name: string): TestCuePackBuilder {
    this._name = name
    return this
  }

  public activate(): TestCuePackBuilder {
    this._isActive = true
    return this
  }

  public build(): CuePack {
    const pack = CuePack.create(this._name)

    if (this._isActive) {
      pack.activate()
    }

    return pack
  }
}
