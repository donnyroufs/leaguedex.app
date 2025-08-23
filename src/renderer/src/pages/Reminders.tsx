import { JSX, useState } from 'react'
import { Bell, Plus, Clock, Zap, Target, Timer, X } from 'lucide-react'
import { PageWrapper } from '../components/PageWrapper'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { CreateReminderForm } from '../components/CreateReminderForm'
// @ts-expect-error we need to fix sharing contracts
import { IReminderDto, CreateReminderDto } from '../../../main/app/coaching/ReminderDto'
import { useModal, useToast } from '../hooks'
import { EmptyState } from '@renderer/components/EmptyState'
import { useLoaderData, useRevalidator } from 'react-router'
import { ConfirmDialog } from '@renderer/components/ConfirmDialog'

type LoaderData = {
  reminders: IReminderDto[]
}

export function RemindersPage(): JSX.Element {
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useModal()
  const { reminders } = useLoaderData<LoaderData>()
  const { revalidate } = useRevalidator()
  const toast = useToast()

  const getReminderIcon = (triggerType: IReminderDto['triggerType']): JSX.Element => {
    switch (triggerType) {
      case 'interval':
        return <Timer className="w-4 h-4 text-info" />
      case 'oneTime':
        return <Clock className="w-4 h-4 text-success" />
      case 'event':
        return <Zap className="w-4 h-4 text-warning" />
      case 'objective':
        return <Target className="w-4 h-4 text-premium" />
      default:
        return <Bell className="w-4 h-4 text-neutral" />
    }
  }

  const getReminderColor = (): string => {
    return 'border-border-primary'
  }

  const formatTriggerDisplay = (reminder: IReminderDto): JSX.Element | string => {
    if (reminder.triggerType === 'interval' && reminder.interval) {
      return `Every ${reminder.interval} seconds`
    }

    if (reminder.triggerType === 'oneTime' && reminder.triggerAt) {
      const minutes = Math.floor(reminder.triggerAt / 60)
      const seconds = reminder.triggerAt % 60
      return `At ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    if (reminder.triggerType === 'event' && reminder.event) {
      return `On ${reminder.event}`
    }

    if (reminder.triggerType === 'objective' && reminder.objective && reminder.beforeObjective) {
      const objectiveName = reminder.objective.charAt(0).toUpperCase() + reminder.objective.slice(1)
      return (
        <>
          {reminder.beforeObjective} seconds before{' '}
          <span className="font-semibold text-premium bg-premium/10 px-2 py-0.5 rounded-md">
            {objectiveName}
          </span>{' '}
          spawns
        </>
      )
    }

    return 'Unknown trigger'
  }

  const getTriggerTypeLabel = (triggerType: IReminderDto['triggerType']): string => {
    switch (triggerType) {
      case 'interval':
        return 'Interval'
      case 'oneTime':
        return 'One-time'
      case 'event':
        return 'Event'
      case 'objective':
        return 'Objective'
      default:
        return 'Unknown'
    }
  }

  const handleCreateReminder = async (data: CreateReminderDto): Promise<void> => {
    setIsCreating(true)
    try {
      await window.api.app.addReminder(data)
      toast.success('Reminder created successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to create reminder:', error)
      toast.error('Failed to create reminder')
    } finally {
      setIsCreating(false)
      revalidate()
    }
  }

  const handleRemoveReminder = async (id: string): Promise<void> => {
    try {
      await window.api.app.removeReminder(id)
      toast.success('Reminder removed successfully!')
    } catch (error) {
      console.error('Failed to remove reminder:', error)
      toast.error('Failed to remove reminder')
    } finally {
      revalidate()
    }
  }

  const openDeleteConfirmation = (id: string): void => {
    setReminderToDelete(id)
  }

  const closeDeleteConfirmation = (): void => {
    setReminderToDelete(null)
  }

  const confirmDelete = (): void => {
    if (reminderToDelete) {
      handleRemoveReminder(reminderToDelete)
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between p-8 border-b border-border-primary">
        <h1 className="text-2xl font-semibold text-text-primary">Reminders</h1>
        <Button onClick={onOpen} size="md">
          <Plus size={16} className="mr-2" />
          Add Reminder
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-8">
        {reminders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              title="No reminders"
              subtitle="Add a reminder to get started"
              icon={<Bell size={32} className="text-text-tertiary" />}
            />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`relative border rounded-lg bg-bg-secondary ${getReminderColor()}`}
                >
                  <button
                    onClick={() => openDeleteConfirmation(reminder.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-bg-primary/50 transition-colors"
                    aria-label="Remove reminder"
                  >
                    <X className="w-4 h-4 text-text-tertiary hover:text-text-secondary" />
                  </button>
                  <div className="p-5">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center border border-border-primary/20">
                        {getReminderIcon(reminder.triggerType)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                          {getTriggerTypeLabel(reminder.triggerType)}
                        </span>
                        <div className="w-6 h-px bg-current opacity-30 mt-1.5"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-text-primary font-semibold text-lg leading-tight">
                        {reminder.text}
                      </h3>
                      <div className="flex items-center space-x-2.5 text-text-secondary">
                        <Timer className="w-3.5 h-3.5 text-text-tertiary" />
                        <span className="text-sm font-medium">
                          {formatTriggerDisplay(reminder)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border-primary/20">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-info/80"></div>
                        <span className="text-xs text-text-tertiary font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose} title="Create New Reminder">
        <CreateReminderForm
          onSubmit={handleCreateReminder}
          onCancel={onClose}
          isLoading={isCreating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={reminderToDelete !== null}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </PageWrapper>
  )
}
