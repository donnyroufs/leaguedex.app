import { IUseCase } from '../shared-kernel/IUseCase'
import { ICuePackRepository } from './ports/ICuePackRepository'

export class ActivateCuePackUseCase implements IUseCase<string, void> {
  public constructor(private readonly _cuePackRepository: ICuePackRepository) {}

  // TODO: rollback transactions UOW
  public async execute(id: string): Promise<void> {
    const currentActivePack = await this._cuePackRepository.active()
    const packResult = await this._cuePackRepository.load(id)

    if (!currentActivePack.isOk()) {
      throw new Error('Failed to get current active pack')
    }

    if (!packResult.isOk() || packResult.unwrap() === null) {
      throw new Error('Failed to load pack')
    }

    const currentActivePackToDeactivate = currentActivePack.unwrap()
    const packToActivate = packResult.unwrap()!

    currentActivePackToDeactivate?.deactivate()
    packToActivate.activate()

    const saveResult = await this._cuePackRepository.save(packToActivate)

    if (!saveResult.isOk()) {
      throw new Error('Failed to activate cue pack')
    }

    if (currentActivePackToDeactivate !== null) {
      const saveResult2 = await this._cuePackRepository.save(currentActivePackToDeactivate)

      if (!saveResult2.isOk()) {
        throw new Error('Failed to deactivate cue pack')
      }
    }
  }
}
