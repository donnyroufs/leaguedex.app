import { GameTickEvent } from './domain-events'
import { IAudioPlayer } from './ports/IAudioPlayer'
import { IEventBus } from './ports/IEventBus'
import { ILogger } from './ports/ILogger'
import { ICueDto } from './ICueDto'
import { CueEngine } from './CueEngine'
import { CreateCueDto, AddCueToPackUseCase } from './AddCueToPackUseCase'
import { RemoveCueUseCase } from './RemoveCueUseCase'
import { GetCuesUseCase } from './GetCuesUseCase'
import { ICuePackRepository } from './ports/ICuePackRepository'
import { IUserSettingsRepository } from './ports/IUserSettingsRepository'

export class CueService {
  public constructor(
    private readonly _addCueToPackUseCase: AddCueToPackUseCase,
    private readonly _getCuesUseCase: GetCuesUseCase,
    private readonly _removeCueUseCase: RemoveCueUseCase,
    private readonly _eventBus: IEventBus,
    private readonly _audioPlayer: IAudioPlayer,
    private readonly _logger: ILogger,
    private readonly _cueRepository: ICuePackRepository,
    private readonly _userSettingsRepository: IUserSettingsRepository,
    private readonly _audioDir: string
  ) {}

  public async start(): Promise<void> {
    this._eventBus.subscribe('game-tick', this.onGameTick.bind(this))
  }

  public async stop(): Promise<void> {
    this._eventBus.unsubscribe('game-tick', this.onGameTick.bind(this))
    CueEngine.clear()
  }

  public async addCue(data: CreateCueDto): Promise<string> {
    return this._addCueToPackUseCase.execute(data)
  }

  /**
   * Used for testing the generated cue audio. This is so that you can
   * get an idea of what it sounds like.
   */
  public async playCue(cueId: string): Promise<void> {
    const pack = await this._cueRepository.active()

    if (!pack) {
      throw new Error('No active pack')
    }

    const cues = pack.unwrap()!.cues
    const cue = cues.find((x) => x.id === cueId)

    if (!cue) {
      throw new Error(`Cue with id ${cueId} not found`)
    }

    const settings = await this._userSettingsRepository.load()

    if (settings.isErr()) {
      this._logger.error('Failed to load user settings', { error: settings.getError() })
      throw new Error('Failed to load user settings')
    }

    await this._audioPlayer.play(cue.audioUrl.fullPath(this._audioDir), settings.getValue().volume)
  }

  public async getCues(): Promise<ICueDto[]> {
    return this._getCuesUseCase.execute()
  }

  public async removeCue(id: string): Promise<void> {
    return this._removeCueUseCase.execute(id)
  }

  protected async onGameTick(evt: GameTickEvent): Promise<void> {
    const { gameTime } = evt.payload.state

    // TODO: we probably should cache the active pack and invalidate it when:
    // - Updated the pack (added,removed
    // - We activate/deactivate a pack
    const pack = await this._cueRepository.active()

    if (pack.isErr() || pack.unwrap() === null) {
      return
    }

    const cues = pack.unwrap()!.cues

    const dueCues = CueEngine.getDueCues(evt.payload.state, cues)

    this._logger.info('Processing cues', {
      gameTime,
      cues: cues.map((x) => x.id),
      dueCues: dueCues.map((x) => x.id)
    })

    const settings = await this._userSettingsRepository.load()

    if (settings.isErr()) {
      this._logger.error('Failed to load user settings', { error: settings.getError() })
      throw new Error('Failed to load user settings')
    }

    const volume = settings.unwrap().volume

    // TODO: instead of awaiting it, we should create a queue so that we process it in the background
    for (const cue of dueCues) {
      await this._audioPlayer.play(cue.audioUrl.fullPath(this._audioDir), volume)
    }
  }
}
