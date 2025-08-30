import { ActivateCuePackUseCase } from './ActivateCuePackUseCase'
import { CreateCuePackUseCase } from './CreateCuePackUseCase'
import { CuePackCreatedEvent, CuePackImportedEvent, CuePackRemovedEvent } from './domain-events'
import { ExportPackUseCase } from './ExportPackUseCase'
import { GetActiveCuePackUseCase } from './GetActiveCuePackUseCase'
import { GetCuePacksUseCase, ICuePackDto } from './GetCuePacksUseCase'
import { ImportPackUseCase } from './ImportPackUseCase'
import { IEventBus } from './ports/IEventBus'
import { ILogger } from './ports/ILogger'
import { RemoveCuePackUseCase } from './RemoveCuePackUseCase'

export class CuePackService {
  public constructor(
    private readonly _createCuePackUseCase: CreateCuePackUseCase,
    private readonly _activateCuePackUseCase: ActivateCuePackUseCase,
    private readonly _getCuePacksUseCase: GetCuePacksUseCase,
    private readonly _getActiveCuePackUseCase: GetActiveCuePackUseCase,
    private readonly _eventBus: IEventBus,
    private readonly _logger: ILogger,
    private readonly _removeCuePackUseCase: RemoveCuePackUseCase,
    private readonly _importPackUseCase: ImportPackUseCase,
    private readonly _exportPackUseCase: ExportPackUseCase
  ) {}

  public async start(): Promise<void> {
    this._eventBus.subscribe('cue-pack-created', this.onCuePackCreated.bind(this))
    this._eventBus.subscribe('cue-pack-removed', this.onCuePackRemoved.bind(this))
    this._eventBus.subscribe('cue-pack-imported', this.onCuePackImported.bind(this))
  }

  public async stop(): Promise<void> {
    this._eventBus.unsubscribe('cue-pack-created', this.onCuePackCreated.bind(this))
    this._eventBus.unsubscribe('cue-pack-removed', this.onCuePackRemoved.bind(this))
    this._eventBus.unsubscribe('cue-pack-imported', this.onCuePackImported.bind(this))
  }

  public async removeCuePack(id: string): Promise<void> {
    return this._removeCuePackUseCase.execute({ id })
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

  public async exportPack(id: string): Promise<string> {
    return this._exportPackUseCase.execute({ id })
  }

  private async onCuePackCreated(event: CuePackCreatedEvent): Promise<void> {
    this._logger.info('Cue pack created', { event })
    try {
      await this._activateCuePackUseCase.execute(event.payload.id)
    } catch (error) {
      this._logger.error('Failed to activate cue pack', { error })
    }
  }

  public async importPack(code: string): Promise<void> {
    return this._importPackUseCase.execute({ code })
  }

  private async onCuePackRemoved(event: CuePackRemovedEvent): Promise<void> {
    this._logger.info('Cue pack removed', { event })
    try {
      const packs = await this._getCuePacksUseCase.execute()

      if (packs.length === 0) {
        return
      }

      const activePack = await this._getActiveCuePackUseCase.execute()

      // TODO: test this case. Incase we have an active pack we should not activate another cue pack.
      // Could argue that this should be in the use case itself.
      if (activePack !== null) {
        return
      }

      const pack = packs[0]!

      await this._activateCuePackUseCase.execute(pack.id)
    } catch (error) {
      this._logger.error('Failed to activate cue pack', { error })
    }
  }

  private async onCuePackImported(event: CuePackImportedEvent): Promise<void> {
    this._logger.info('Cue pack imported', { event })
    try {
      await this._activateCuePackUseCase.execute(event.cuePackId)
    } catch (error) {
      this._logger.error('Failed to activate cue pack', { error })
    }
  }
}
