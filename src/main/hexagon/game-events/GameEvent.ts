export abstract class GameEvent<TData> {
  public constructor(
    public readonly id: number,
    public readonly data: TData
  ) {}
}
