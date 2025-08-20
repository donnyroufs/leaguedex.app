export interface IReminderDto {
  id: string
  text: string
  triggerType: 'interval' | 'oneTime' | 'event'
  interval?: number
  triggerAt?: number
  event?: string
}
