import z from 'zod'

import { GameTickEvent, IEventBus, Result } from '../shared-kernel'
import { IReminderDto } from './ReminderDto'
import { IReminderRepository } from './IReminderRepository'
import { IAudioPlayer } from './IAudioPlayer'
import { ITextToSpeech } from './ITextToSpeech'
import { ILogger } from '../shared-kernel/ILogger'

const createReminderSchema = z.object({
  text: z.string().min(1),
  triggerType: z.enum(['interval', 'oneTime', 'event']),
  interval: z.number().min(1).optional(),
  triggerAt: z.number().min(0).optional(),
  event: z.string().optional()
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
      text: parsedData.text,
      audioUrl: audioPath,
      triggerType: parsedData.triggerType,
      interval: parsedData.interval,
      triggerAt: parsedData.triggerAt,
      event: parsedData.event
    })

    return saveResult.throwOrReturn(id)
  }

  public async getReminders(): Promise<IReminderDto[]> {
    const result = await this._reminderRepository.all()

    const reminders = result.unwrap()

    return reminders.map((reminder) => ({
      id: reminder.id,
      text: reminder.text,
      triggerType: reminder.triggerType,
      interval: reminder.interval,
      triggerAt: reminder.triggerAt,
      event: reminder.event
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
    const dueReminders = reminders.unwrap().filter((reminder) => {
      if (reminder.triggerType === 'interval' && reminder.interval) {
        return evt.data.gameTime % reminder.interval === 0
      }

      if (reminder.triggerType === 'oneTime' && reminder.triggerAt) {
        return evt.data.gameTime === reminder.triggerAt
      }

      return false
    })

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
