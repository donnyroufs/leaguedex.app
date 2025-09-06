import { IEventBus } from '@hexagon/ports/IEventBus'

export class DummyEventBus implements IEventBus {
  public subscribe(): void {
    return
  }
  public unsubscribe(): void {
    return
  }
  public publish(): void {
    return
  }
}
