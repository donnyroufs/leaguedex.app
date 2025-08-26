// Ports - what adapters can depend on
export * from './ports/IAudioPlayer'
export * from './ports/ILogger'
export * from './ports/INotifyElectron'
export * from './ports/IReminderRepository'
export * from './ports/ITextToSpeechGenerator'
export * from './ports/ITimer'
export * from './ports/IEventBus'
export * from './ports/IGameDataProvider'

// Domain models that adapters need
export * from './Reminder'
export * from './ReminderDto'
export * from './GameState'
export * from './ActivePlayer'
export * from './Team'
export * from './GameData'

// Events that adapters need
export * from './game-events'
export * from './domain-events'

// Use cases that adapters need
export * from './CreateReminderUseCase'
export * from './GetRemindersUseCase'
export * from './RemoveReminderUseCase'
export * from './RemindersGameTickListener'
export * from './GameMonitor'
export * from './ReminderService'
export * from './GameObjectiveTracker'
