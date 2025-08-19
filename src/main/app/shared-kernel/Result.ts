export class Result<T = void, E = Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  public static ok<T>(value?: T): Result<T, never> {
    return new Result<T, never>(value)
  }

  public static err<E>(error: E): Result<never, E> {
    return new Result<never, E>(undefined, error)
  }

  public isOk(): boolean {
    return this._error === undefined
  }

  public isErr(): boolean {
    return !this.isOk()
  }

  public unwrap(): T {
    if (this.isErr()) {
      throw new Error('Cannot unwrap failed result')
    }

    return this._value as T
  }

  public getValue(): T {
    if (this.isErr()) {
      throw new Error('Cannot get value from failed result')
    }

    return this._value as T
  }

  public getError(): E {
    if (this.isOk()) {
      throw new Error('Cannot get error from successful result')
    }
    return this._error as E
  }
}
