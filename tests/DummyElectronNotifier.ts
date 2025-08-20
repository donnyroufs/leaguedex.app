import { INotifyElectron } from '../src/main/hexagon/ports/INotifyElectron'

export class DummyElectronNotifier implements INotifyElectron {
  public notify(): void {
    // do nothing
  }
}
