import z from 'zod'

import { GameTickEvent, IEventBus, Result } from '../shared-kernel'
import { IReminderDto } from './ReminderDto'
import { IReminderRepository } from './IReminderRepository'
import { IAudioPlayer } from './IAudioPlayer'
import { ITextToSpeech } from './ITextToSpeech'
import { ILogger } from '../shared-kernel/ILogger'

const createReminderSchema = z.object({
  interval: z.number().min(1),
  text: z.string().min(1)
})

export type CreateReminderDto = z.infer<typeof createReminderSchema>

export class CoachingModule {
  public constructor(
    private readonly _reminderRepository: IReminderRepository,
    private readonly _audioPlayer: IAudioPlayer,
    private readonly _tts: ITextToSpeech,
    private readonly _eventBus: IEventBus,
    private readonly _logger: ILogger
  ) {
    this._eventBus.subscribe('game-tick', (evt) => {
      this.onProcessReminders(evt)
    })
  }

  public async addReminder(data: CreateReminderDto): Promise<string> {
    const parsedData = createReminderSchema.parse(data)
    const id = crypto.randomUUID()
    const result = await this._tts.generate(parsedData.text)
    const audioPath = result.unwrap()

    const saveResult = await this._reminderRepository.save({
      id,
      interval: parsedData.interval,
      text: parsedData.text,
      audioUrl: audioPath
    })

    return saveResult.throwOrReturn(id)
  }

  public async getReminders(): Promise<IReminderDto[]> {
    const result = await this._reminderRepository.all()

    const reminders = result.unwrap()

    return reminders.map((reminder) => ({
      id: reminder.id,
      interval: reminder.interval,
      text: reminder.text
    }))
  }

  public async init(): Promise<Result<string, Error>> {
    return Result.ok('Coaching initialized')
  }

  public async dispose(): Promise<Result<string, Error>> {
    return Result.ok('Coaching disposed')
  }

  private async onProcessReminders(evt: GameTickEvent): Promise<void> {
    const reminders = await this._reminderRepository.all()
    const dueReminders = reminders
      .unwrap()
      .filter((reminder) => evt.data.gameTime % reminder.interval === 0)

    this._logger.info('Processing reminders', {
      gameTime: evt.data.gameTime,
      dueRemindersLen: dueReminders.length
    })

    for (const reminder of dueReminders) {
      await this._audioPlayer.play(reminder.audioUrl)
    }
  }
}

export type { IReminderRepository } from './IReminderRepository'
export { FileSystemReminderRepository } from './FileSystemReminderRepository'
