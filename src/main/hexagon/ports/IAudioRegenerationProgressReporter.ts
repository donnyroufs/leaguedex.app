export interface IAudioRegenerationProgressReporter {
  reportProgress(
    completedPacks: number,
    totalPacks: number,
    completedCues: number,
    totalUniqueCues: number
  ): void
  reportComplete(): void
}
