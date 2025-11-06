export class SupportItems {
  private static readonly UPGRADES = new Map<number, Set<number>>([
    [3865, new Set([3866])],
    [3866, new Set([3867])],
    [3867, new Set([3877, 3869, 3870, 3871, 3876])]
  ])

  public static isUpgrade(fromItemId: number, toItemId: number): boolean {
    const possibleUpgrades = this.UPGRADES.get(fromItemId)
    return possibleUpgrades != null && possibleUpgrades.has(toItemId)
  }
}
