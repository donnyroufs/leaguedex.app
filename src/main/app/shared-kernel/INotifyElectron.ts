// TOOD: make type safe;

export interface INotifyElectron {
  notify<TData = unknown>(channel: string, data: TData): void
}
