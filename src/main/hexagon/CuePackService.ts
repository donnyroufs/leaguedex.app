import { ActivateCuePackUseCase } from './ActivateCuePackUseCase'
import { CreateCuePackUseCase } from './CreateCuePackUseCase'
import { CuePackCreatedEvent } from './domain-events'
import { GetActiveCuePackUseCase } from './GetActiveCuePackUseCase'
import { GetCuePacksUseCase, ICuePackDto } from './GetCuePacksUseCase'
import { IEventBus } from './ports/IEventBus'
import { ILogger } from './ports/ILogger'

export class CuePackService {
  public constructor(
    private readonly _createCuePackUseCase: CreateCuePackUseCase,
    private readonly _activateCuePackUseCase: ActivateCuePackUseCase,
    private readonly _getCuePacksUseCase: GetCuePacksUseCase,
    private readonly _getActiveCuePackUseCase: GetActiveCuePackUseCase,
    private readonly _eventBus: IEventBus,
    private readonly _logger: ILogger
  ) {}

  public async start(): Promise<void> {
    this._eventBus.subscribe('cue-pack-created', this.onCuePackCreated.bind(this))
  }

  public async stop(): Promise<void> {
    this._eventBus.unsubscribe('cue-pack-created', this.onCuePackCreated.bind(this))
  }

  public async createCuePack(name: string): Promise<string> {
    return this._createCuePackUseCase.execute({ name })
  }

  public async activateCuePack(id: string): Promise<void> {
    return this._activateCuePackUseCase.execute(id)
  }

  public async getCuePacks(): Promise<ICuePackDto[]> {
    return this._getCuePacksUseCase.execute()
  }

  public async getActiveCuePack(): Promise<ICuePackDto | null> {
    return this._getActiveCuePackUseCase.execute()
  }

  private async onCuePackCreated(event: CuePackCreatedEvent): Promise<void> {
    try {
      await this._activateCuePackUseCase.execute(event.payload.id)
    } catch (error) {
      this._logger.error('Failed to activate cue pack', { error })
    }
  }
}
