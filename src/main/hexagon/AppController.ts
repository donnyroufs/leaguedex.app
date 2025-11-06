import {
  ILogger,
  GameMonitor,
  IAppController,
  IEventBus,
  CueService,
  CuePackService,
  IUserSettingsDto,
  IUserSettingsRepository
} from '.'
import { CreateCueDto, GameDataDto, ICueDto } from '@contracts'
import { ICuePackDto } from './GetCuePacksUseCase'
import { CreateCuePackDto } from './CreateCuePackUseCase'

export class AppController implements IAppController {
  public constructor(
    private readonly _gameMonitor: GameMonitor,
    private readonly _logger: ILogger,
    private readonly _cueService: CueService,
    private readonly _eventBus: IEventBus,
    private readonly _cuePackService: CuePackService,
    private readonly _userSettingsRepository: IUserSettingsRepository
  ) {}

  public async updateUserSettings(data: IUserSettingsDto): Promise<void> {
    const res = await this._userSettingsRepository.save(data)
    return res.unwrap()
  }

  public async getUserSettings(): Promise<IUserSettingsDto> {
    const res = await this._userSettingsRepository.load()
    return res.unwrap()
  }

  public async start(): Promise<void> {
    await this._gameMonitor.start()
    await this._cueService.start()
    await this._cuePackService.start()

    this._logger.info('app started')
  }

  public async stop(): Promise<void> {
    await this._gameMonitor.dispose()
    await this._cueService.stop()
    await this._cuePackService.stop()
    this._logger.info('app stopped')
  }

  public async playCue(id: string): Promise<void> {
    this._logger.info('playCue', { id })
    return this._cueService.playCue(id)
  }

  public async activateCuePack(id: string): Promise<void> {
    this._logger.info('activateCuePack', { id })
    return this._cuePackService.activateCuePack(id)
  }

  public async getCuePacks(): Promise<ICuePackDto[]> {
    this._logger.info('getCuePacks')
    return this._cuePackService.getCuePacks()
  }

  public async createCuePack(data: CreateCuePackDto): Promise<string> {
    this._logger.info('createCuePack', { data })
    return this._cuePackService.createCuePack(data.name)
  }

  public async getActiveCuePack(): Promise<ICuePackDto | null> {
    this._logger.info('getActiveCuePack')
    return this._cuePackService.getActiveCuePack()
  }

  public getCues(): Promise<ICueDto[]> {
    this._logger.info('getCues')
    return this._cueService.getCues()
  }

  public async exportPack(id: string): Promise<string> {
    this._logger.info('exporting pack', { id })
    return this._cuePackService.exportPack(id)
  }

  public async importPack(code: string): Promise<void> {
    this._logger.info('importing pack', { code })
    return this._cuePackService.importPack(code)
  }

  public async removeCuePack(id: string): Promise<void> {
    this._logger.info('removing cue pack', { id })
    return this._cuePackService.removeCuePack(id)
  }

  public async addCue(data: CreateCueDto): Promise<string> {
    this._logger.info('addCue', { data })
    return this._cueService.addCue(data)
  }

  public async removeCue(id: string): Promise<void> {
    this._logger.info('removeCue', { id })
    return this._cueService.removeCue(id)
  }

  public onGameTick(callback: (gameData: GameDataDto) => void): void {
    this._eventBus.subscribe('game-tick', (evt) => {
      callback({
        type: 'game-data',
        started: true,
        time: evt.payload.state.gameTime
      })
    })
  }

  public onGameStarted(callback: (gameData: GameDataDto) => void): void {
    this._eventBus.subscribe('game-started', (evt) => {
      callback({
        type: 'game-data',
        started: true,
        time: evt.payload.gameTime
      })
    })
  }

  public onGameStopped(callback: (gameData: GameDataDto) => void): void {
    this._eventBus.subscribe('game-stopped', () => {
      callback({
        type: 'game-data',
        started: false,
        time: null
      })
    })
  }
}
