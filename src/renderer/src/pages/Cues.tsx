import { JSX, useState } from 'react'
import { Bell, Plus, Clock, Zap, Target, Timer, X } from 'lucide-react'
import { PageWrapper } from '../components/PageWrapper'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { CreateCueForm } from '../components/CreateCueForm'
import { useModal, useToast } from '../hooks'
import { EmptyState } from '@renderer/components/EmptyState'
import { useLoaderData, useRevalidator } from 'react-router'
import { ConfirmDialog } from '@renderer/components/ConfirmDialog'
import { CreateCueDto, ICueDto } from '@hexagon/index'

type LoaderData = {
  cues: ICueDto[]
}

export function CuesPage(): JSX.Element {
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [cueToDelete, setCueToDelete] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useModal()
  const { cues } = useLoaderData<LoaderData>()
  const { revalidate } = useRevalidator()
  const toast = useToast()

  const getCueIcon = (triggerType: ICueDto['triggerType']): JSX.Element => {
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

  const getCueColor = (): string => {
    return 'border-border-primary'
  }

  const formatTriggerDisplay = (cue: ICueDto): JSX.Element | string => {
    if (cue.triggerType === 'interval' && cue.interval) {
      return `Every ${cue.interval} seconds`
    }

    if (cue.triggerType === 'oneTime' && cue.triggerAt) {
      const minutes = Math.floor(cue.triggerAt / 60)
      const seconds = cue.triggerAt % 60
      return `At ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    if (cue.triggerType === 'event' && cue.event) {
      return `On ${cue.event}`
    }

    if (cue.triggerType === 'objective' && cue.objective && cue.beforeObjective) {
      const objectiveName = cue.objective.charAt(0).toUpperCase() + cue.objective.slice(1)
      return (
        <>
          {cue.beforeObjective} seconds before{' '}
          <span className="font-semibold text-premium bg-premium/10 px-2 py-0.5 rounded-md">
            {objectiveName}
          </span>{' '}
          spawns
        </>
      )
    }

    return 'Unknown trigger'
  }

  const getTriggerTypeLabel = (triggerType: ICueDto['triggerType']): string => {
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

  const handleCreateCue = async (data: CreateCueDto): Promise<void> => {
    setIsCreating(true)
    try {
      await window.api.app.addCue(data)
      toast.success('Cue created successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to create cue:', error)
      toast.error('Failed to create cue')
    } finally {
      setIsCreating(false)
      revalidate()
    }
  }

  const handleRemoveCue = async (id: string): Promise<void> => {
    try {
      await window.api.app.removeCue(id)
      toast.success('Cue removed successfully!')
    } catch (error) {
      console.error('Failed to remove cue:', error)
      toast.error('Failed to remove cue')
    } finally {
      revalidate()
    }
  }

  const openDeleteConfirmation = (id: string): void => {
    setCueToDelete(id)
  }

  const closeDeleteConfirmation = (): void => {
    setCueToDelete(null)
  }

  const confirmDelete = (): void => {
    if (cueToDelete) {
      handleRemoveCue(cueToDelete)
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between h-20 p-8 border-b border-border-primary">
        <h1 className="text-2xl font-semibold text-text-primary">Cues</h1>
        <Button onClick={onOpen} size="md">
          <Plus size={16} className="mr-2" />
          Add Cue
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-8">
        {cues.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              title="No cues"
              subtitle="Add a cue to get started"
              icon={<Bell size={32} className="text-text-tertiary" />}
            />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cues.map((cue) => (
                <div
                  key={cue.id}
                  className={`relative border rounded-lg bg-bg-secondary ${getCueColor()}`}
                >
                  <button
                    onClick={() => openDeleteConfirmation(cue.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-bg-primary/50 transition-colors"
                    aria-label="Remove cue"
                  >
                    <X className="w-4 h-4 text-text-tertiary hover:text-text-secondary" />
                  </button>
                  <div className="p-5">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center border border-border-primary/20">
                        {getCueIcon(cue.triggerType)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                          {getTriggerTypeLabel(cue.triggerType)}
                        </span>
                        <div className="w-6 h-px bg-current opacity-30 mt-1.5"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-text-primary font-semibold text-lg leading-tight">
                        {cue.text}
                      </h3>
                      <div className="flex items-center space-x-2.5 text-text-secondary">
                        <Timer className="w-3.5 h-3.5 text-text-tertiary" />
                        <span className="text-sm font-medium">{formatTriggerDisplay(cue)}</span>
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

      <Modal isOpen={isOpen} onClose={onClose} title="Create New Cue">
        <CreateCueForm onSubmit={handleCreateCue} onCancel={onClose} isLoading={isCreating} />
      </Modal>

      <ConfirmDialog
        isOpen={cueToDelete !== null}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        title="Delete Cue"
        message="Are you sure you want to delete this cue? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </PageWrapper>
  )
}
