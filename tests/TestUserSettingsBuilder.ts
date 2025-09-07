import { UserSettings } from '@hexagon/UserSettings'

export class TestUserSettingsBuilder {
  private _volume: number = 1

  public withVolume(volume: number): this {
    this._volume = volume
    return this
  }

  public build(): UserSettings {
    return {
      volume: this._volume
    }
  }
}
