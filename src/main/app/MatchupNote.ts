/**
 * A note about a
 */
export class MatchupNote {
  public constructor(
    public readonly id: string,

    public readonly content: string,
    /**
     * A matchup is going to be a unique ID like `orianna-vs-zed`
     */
    public readonly matchupId: string,
    /**
     * Describes what game we played incase we need to fetch the game data. This is the RIOT id.
     */
    public readonly gameId: string,
    public readonly createdAt: Date
  ) {}
}
