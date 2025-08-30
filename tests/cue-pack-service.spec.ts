import { describe, test, expect } from 'vitest'
import { EventBusSpy } from './EventBusSpy'

import { CuePackService } from '@hexagon/CuePackService'
import { FakeCuePackRepository, NullLogger } from 'src/main/adapters/outbound'
import { CreateCuePackUseCase } from '@hexagon/CreateCuePackUseCase'
import { ActivateCuePackUseCase } from '@hexagon/ActivateCuePackUseCase'
import { GetCuePacksUseCase } from '@hexagon/GetCuePacksUseCase'
import { GetActiveCuePackUseCase } from '@hexagon/GetActiveCuePackUseCase'

describe('CuePackService', () => {
  test('Should setup a listener to deactivate previous CuePack when a new one has been created', async () => {
    const cuePackRepository = new FakeCuePackRepository()
    const eventBus = new EventBusSpy()
    const service = new CuePackService(
      new CreateCuePackUseCase(cuePackRepository, eventBus),
      new ActivateCuePackUseCase(cuePackRepository),
      new GetCuePacksUseCase(cuePackRepository),
      new GetActiveCuePackUseCase(cuePackRepository),
      eventBus,
      new NullLogger()
    )

    await service.start()

    expect(eventBus.subscribers).toEqual(['cue-pack-created'])

    await service.stop()
  })
})
