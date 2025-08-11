export class MatchupNote {
  public constructor(
    public readonly id: string,

    public readonly content: string,
    /**
     * A matchup is going to be a unique ID like `orianna-vs-zed`
     */
    public readonly matchupId: string,
    public readonly gameId: string,
    public readonly createdAt: Date
  ) {}
}
