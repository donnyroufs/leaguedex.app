export class AudioFileName {
  private readonly _fileName: string
  private readonly _extension: 'mp3' | 'wav'

  public fullPath(audioDir: string): string {
    return audioDir + '/' + this._fileName + '.' + this._extension
  }

  public get fileName(): string {
    return this._fileName
  }

  public get extension(): 'mp3' | 'wav' {
    return this._extension
  }

  /**
   * @param text The cue text.
   */
  private constructor(text: string, extension: 'mp3' | 'wav') {
    this._fileName = this.createFileName(text)
    this._extension = extension
  }

  private createFileName(text: string): string {
    const stripped = text.replace(/\.(mp3|wav)$/i, '').trim()

    return stripped
      .replace(/[^a-zA-Z0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
  }

  public static createMP3(text: string): AudioFileName {
    return new AudioFileName(text, 'mp3')
  }

  public static createWAV(text: string): AudioFileName {
    return new AudioFileName(text, 'wav')
  }

  public static fromJSON(json: { fileName: string; extension: 'mp3' | 'wav' }): AudioFileName {
    // Create instance directly without going through constructor
    const instance = Object.create(AudioFileName.prototype)
    instance._fileName = json.fileName
    instance._extension = json.extension
    return instance
  }

  public toJSON(): {
    fileName: string
    extension: 'mp3' | 'wav'
  } {
    return {
      fileName: this._fileName,
      extension: this._extension
    }
  }
}
