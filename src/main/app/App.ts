import { CoachingModule } from './coaching'

export class App {
  public constructor(private readonly _coachingModule: CoachingModule) {}

  public async activate(): Promise<void> {
    const result = await this._coachingModule.activate()
    const value = result.unwrap()
    console.log(value)
  }

  public async deactivate(): Promise<void> {
    const result = await this._coachingModule.deactivate()
    const value = result.unwrap()
    console.log(value)
  }
}
