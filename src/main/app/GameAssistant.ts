import { GameDetector } from './GameDetector'
import { Contract, IDispatcher } from './IDispatcher'

export class GameAssistant {
  private _intervalId: NodeJS.Timeout | null = null

  public constructor(
    private readonly _gameDetector: GameDetector,
    private readonly _dispatcher: IDispatcher
  ) {}

  public start(): void {
    this._intervalId = setInterval(async () => {
      const gameTime = await this._gameDetector.detect()

      this._dispatcher.dispatch('game-data', {
        playing: gameTime !== null,
        gameTime: gameTime
      })
    }, 1000)
  }

  public async [Symbol.asyncDispose](): Promise<void> {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId)
      this._intervalId = null
    }
  }

  public on<TName extends keyof Contract>(
    name: TName,
    callback: (data: Contract[TName]) => void
  ): this {
    this._dispatcher.subscribe(name, callback)
    return this
  }
}
