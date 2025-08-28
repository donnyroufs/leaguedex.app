import { GameTickEvent } from './domain-events'
import { IAudioPlayer } from './ports/IAudioPlayer'
import { IEventBus } from './ports/IEventBus'
import { ILogger } from './ports/ILogger'
import { ICueDto } from './ICueDto'
import { CueEngine } from './CueEngine'
import { CreateCueDto, CreateCueUseCase } from './CreateCueUseCase'
import { ICueRepository } from './ports/ICueRepository'
import { RemoveCueUseCase } from './RemoveCueUseCase'
import { GetCuesUseCase } from './GetCuesUseCase'

export class CueService {
  public constructor(
    private readonly _createCueUseCase: CreateCueUseCase,
    private readonly _getCuesUseCase: GetCuesUseCase,
    private readonly _removeCueUseCase: RemoveCueUseCase,
    private readonly _eventBus: IEventBus,
    private readonly _audioPlayer: IAudioPlayer,
    private readonly _logger: ILogger,
    private readonly _cueRepository: ICueRepository
  ) {}

  public async start(): Promise<void> {
    this._eventBus.subscribe('game-tick', this.onGameTick.bind(this))
  }

  public async stop(): Promise<void> {
    this._eventBus.unsubscribe('game-tick', this.onGameTick.bind(this))
  }

  public async addCue(data: CreateCueDto): Promise<string> {
    return this._createCueUseCase.execute(data)
  }

  public async getCues(): Promise<ICueDto[]> {
    return this._getCuesUseCase.execute()
  }

  public async removeCue(id: string): Promise<void> {
    return this._removeCueUseCase.execute(id)
  }

  protected async onGameTick(evt: GameTickEvent): Promise<void> {
    const { gameTime } = evt.payload.state

    const cues = await this._cueRepository.all()
    const dueCues = CueEngine.getDueCues(evt.payload.state, cues.unwrap())

    this._logger.info('Processing cues', {
      gameTime,
      cues: cues.unwrap().map((x) => x.id),
      dueCues: dueCues.map((x) => x.id)
    })

    for (const cue of dueCues) {
      await this._audioPlayer.play(cue.audioUrl.fullPath)
    }
  }
}
