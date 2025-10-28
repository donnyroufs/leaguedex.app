/**
 * Forked from https://github.com/nomadhoc/sound-play/blob/master/src/index.js
 * needed to fix an issue where powershell was not recognised on windows. Instead of patching sound-play,
 * forking seemed to be the easiest solution since it's just a single file.
 */
import { exec } from 'child_process'
import { promisify } from 'util'

/* MAC PLAY COMMAND */
const macPlayCommand = (path: string, volume: number, rate: number): string =>
  `afplay "${path}" -v ${volume} -r ${rate}`

/* WINDOW PLAY COMMANDS */
const addPresentationCore = `Add-Type -AssemblyName presentationCore;`
const createMediaPlayer = `$player = New-Object system.windows.media.mediaplayer;`
const loadAudioFile = (path: string): string => `$player.open('${path}');`
const playAudio = `$player.Play();`
const stopAudio = `Start-Sleep 1; Start-Sleep -s $player.NaturalDuration.TimeSpan.TotalSeconds;Exit;`

const windowPlayCommand = (path: string, volume: number): string =>
  `%SYSTEMROOT%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe -c ${addPresentationCore} ${createMediaPlayer} ${loadAudioFile(
    path
  )} $player.Volume = ${volume}; ${playAudio} ${stopAudio}`

const execPromise = promisify(exec)

/**
 * Plays an audio file on Mac or Windows
 *
 * @param {string} path - The file path to the audio file that will be played.
 * @param {number} [volume=0.5] - Playback volume as a decimal between 0 and 1.
 *  - Windows: Volume range is 0 to 1. Default is 0.5.
 *  - Mac: Volume range is scaled from 0 to 2 (where 2 is 100% volume). Values above 2 may cause distortion.
 * @param {number} [rate=1] - Playback rate multiplier (only used on Mac). 1 is normal speed.
 *
 * @throws Will throw an error if audio playback fails.
 */
export const soundPlay = {
  play: async (path: string, volume: number = 0.5, rate: number = 1): Promise<void> => {
    const volumeAdjustedByOS = process.platform === 'darwin' ? Math.min(2, volume * 2) : volume

    const playCommand =
      process.platform === 'darwin'
        ? macPlayCommand(path, volumeAdjustedByOS, rate)
        : windowPlayCommand(path, volumeAdjustedByOS)

    await execPromise(playCommand, { windowsHide: true })
  }
}
