import { INotifyElectron } from '../src/main/app/shared-kernel'

export class DummyElectronNotifier implements INotifyElectron {
  public notify(): void {
    // do nothing
  }
}
