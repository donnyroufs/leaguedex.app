export class AudioFileName {
  private readonly _fileName: string
  private readonly _extension: 'mp3' | 'wav'
  private readonly _path: string

  public get fullPath(): string {
    return this._path + '/' + this._fileName + '.' + this._extension
  }

  /**
   * @param text The reminder text.
   */
  private constructor(text: string, extension: 'mp3' | 'wav', path: string) {
    this._fileName = this.createFileName(text)
    this._extension = extension
    this._path = path
  }

  private createFileName(text: string): string {
    const stripped = text.replace(/\.(mp3|wav)$/i, '').trim()

    return stripped
      .replace(/[^a-zA-Z0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
  }

  public static createMP3(text: string, path: string = ''): AudioFileName {
    return new AudioFileName(text, 'mp3', path)
  }

  public static createWAV(text: string, path: string = ''): AudioFileName {
    return new AudioFileName(text, 'wav', path)
  }

  public static fromJSON(json: {
    fileName: string
    extension: 'mp3' | 'wav'
    path: string
  }): AudioFileName {
    return new AudioFileName(json.fileName, json.extension as 'mp3' | 'wav', json.path)
  }

  public toJSON(): {
    fileName: string
    extension: 'mp3' | 'wav'
    path: string
  } {
    return {
      fileName: this._fileName,
      extension: this._extension,
      path: this._path
    }
  }
}
