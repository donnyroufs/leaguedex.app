import { ActivateCuePackUseCase } from './ActivateCuePackUseCase'
import { CreateCuePackUseCase } from './CreateCuePackUseCase'
import { ExportPackUseCase } from './ExportPackUseCase'
import { GetActiveCuePackUseCase } from './GetActiveCuePackUseCase'
import { GetCuePacksUseCase, ICuePackDto } from './GetCuePacksUseCase'
import { ImportPackUseCase } from './ImportPackUseCase'
import { ILogger } from './ports/ILogger'
import { RemoveCuePackUseCase } from './RemoveCuePackUseCase'

export class CuePackService {
  public constructor(
    private readonly _createCuePackUseCase: CreateCuePackUseCase,
    private readonly _activateCuePackUseCase: ActivateCuePackUseCase,
    private readonly _getCuePacksUseCase: GetCuePacksUseCase,
    private readonly _getActiveCuePackUseCase: GetActiveCuePackUseCase,
    private readonly _logger: ILogger,
    private readonly _removeCuePackUseCase: RemoveCuePackUseCase,
    private readonly _importPackUseCase: ImportPackUseCase,
    private readonly _exportPackUseCase: ExportPackUseCase
  ) {}

  public async start(): Promise<void> {
    return
  }

  public async stop(): Promise<void> {
    return
  }

  public async removeCuePack(id: string): Promise<void> {
    await this._removeCuePackUseCase.execute({ id })
    await this.onCuePackRemoved(id)
  }

  public async createCuePack(name: string): Promise<string> {
    const id = await this._createCuePackUseCase.execute({ name })
    await this.onCuePackCreated(id)
    return id
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

  private async onCuePackCreated(id: string): Promise<void> {
    try {
      await this._activateCuePackUseCase.execute(id)
    } catch (error) {
      this._logger.error('Failed to activate cue pack', { error })
    }
  }

  public async importPack(code: string): Promise<void> {
    const id = await this._importPackUseCase.execute({ code })
    await this.onCuePackImported(id)
  }

  private async onCuePackRemoved(id: string): Promise<void> {
    this._logger.info('Cue pack removed', { id })
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

  private async onCuePackImported(id: string): Promise<void> {
    try {
      await this._activateCuePackUseCase.execute(id)
    } catch (error) {
      this._logger.error('Failed to activate cue pack', { error })
    }
  }
}
