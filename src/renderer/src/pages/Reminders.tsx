import { JSX, useState } from 'react'
import { Bell, Plus } from 'lucide-react'
import { PageWrapper } from '../components/PageWrapper'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { CreateReminderForm } from '../components/CreateReminderForm'
import { IReminderDto } from 'src/main/app/coaching/ReminderDto'
import { useModal, useToast } from '../hooks'
import { EmptyState } from '@renderer/components/EmptyState'
import { useLoaderData, useRevalidator } from 'react-router'
import { CreateReminderDto } from 'src/main/app/coaching'

type LoaderData = {
  reminders: IReminderDto[]
}

export function RemindersPage(): JSX.Element {
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const { isOpen, onOpen, onClose } = useModal()
  const { reminders } = useLoaderData<LoaderData>()
  const { revalidate } = useRevalidator()
  const toast = useToast()

  const formatIntervalDisplay = (interval: number, isRepeating: boolean): string => {
    if (isRepeating) {
      return `Every ${interval} seconds`
    }

    const minutes = Math.floor(interval / 60)
    const seconds = interval % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
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

  return (
    <PageWrapper>
      <div className="flex items-center justify-between h-[88px] px-8 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
        <h1 className="text-2xl font-semibold text-text-primary">Reminders</h1>
        <Button onClick={onOpen} size="md">
          <Plus size={16} className="mr-2" />
          Add Reminder
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-8 space-y-8">
        {reminders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              title="No reminders"
              subtitle="Add a reminder to get started"
              icon={<Bell size={32} className="text-text-tertiary" />}
            />
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-bg-secondary border border-border-primary rounded-lg p-4 hover:border-border-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary font-medium">{reminder.text}</p>
                    <p className="text-text-tertiary text-sm">
                      {formatIntervalDisplay(reminder.interval, reminder.isRepeating)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
    </PageWrapper>
  )
}
