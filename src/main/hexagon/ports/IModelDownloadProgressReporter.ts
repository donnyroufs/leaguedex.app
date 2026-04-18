export type ModelDownloadPhase = 'downloading' | 'extracting'

export interface IModelDownloadProgressReporter {
  reportProgress(phase: ModelDownloadPhase, receivedBytes: number, totalBytes: number): void
  reportComplete(): void
  reportError(message: string): void
}
