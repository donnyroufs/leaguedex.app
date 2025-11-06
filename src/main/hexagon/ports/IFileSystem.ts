export interface IFileSystem {
  /**
   * Deletes all files in a directory
   * @param directoryPath The absolute path to the directory
   */
  clearDirectory(directoryPath: string): Promise<void>
}
