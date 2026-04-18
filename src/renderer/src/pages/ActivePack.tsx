import { JSX, useState } from 'react'
import { Bell, Plus, Clock, Zap, Target, Timer, X, Play, Pencil, Sliders } from 'lucide-react'
import { PageWrapper } from '../components/PageWrapper'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { CreateCueForm } from '../components/CreateCueForm'
import { useModal, useToast } from '../hooks'
import { EmptyState } from '@renderer/components/EmptyState'
import { useLoaderData, useRevalidator } from 'react-router'
import { ConfirmDialog } from '@renderer/components/ConfirmDialog'
import { CreateCueDto, EditCueDto, ICueDto, ICuePackDto } from '@hexagon/index'
import { CueTrigger } from '@hexagon/Cue'
import { Predicate } from '@hexagon/triggers/Predicate'
import { FiringMode } from '@hexagon/triggers/FiringMode'
import { getFieldDefinition } from '@hexagon/triggers/GameStateSchema'

type LoaderData = {
  cues: ICueDto[]
  activePack: ICuePackDto | null
}

const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const describePredicate = (predicate: Predicate): string => {
  switch (predicate.op) {
    case 'cmp': {
      const field = getFieldDefinition(predicate.field)
      const label = field?.label ?? predicate.field
      return `${label} ${predicate.operator} ${predicate.value}`
    }
    case 'contains': {
      const field = getFieldDefinition(predicate.field)
      const label = field?.label ?? predicate.field
      return `${label} contains ${predicate.value}`
    }
    case 'and':
      return `(${predicate.children.map(describePredicate).join(' AND ')})`
    case 'or':
      return `(${predicate.children.map(describePredicate).join(' OR ')})`
    case 'not':
      return `NOT (${describePredicate(predicate.child)})`
  }
}

const describeFiring = (firing: FiringMode): string => {
  switch (firing.mode) {
    case 'edge':
      return ''
    case 'edgeWithCooldown':
      return ` (${firing.cooldownSeconds}s cooldown)`
    case 'oncePerGame':
      return ' (once per game)'
  }
}

const describeBuiltIn = (id: 'canon-wave-spawned' | 'support-item-upgraded'): string => {
  switch (id) {
    case 'canon-wave-spawned':
      return 'When a canon wave spawns'
    case 'support-item-upgraded':
      return 'When support item upgrades'
  }
}

const getCueIcon = (trigger: CueTrigger): JSX.Element => {
  switch (trigger.kind) {
    case 'interval':
      return <Timer className="w-4 h-4 text-info" />
    case 'oneTime':
      return <Clock className="w-4 h-4 text-success" />
    case 'objective':
      return <Target className="w-4 h-4 text-premium" />
    case 'builtIn':
      return <Zap className="w-4 h-4 text-warning" />
    case 'predicate':
      return <Sliders className="w-4 h-4 text-info" />
  }
}

const getTriggerTypeLabel = (trigger: CueTrigger): string => {
  switch (trigger.kind) {
    case 'interval':
      return 'Interval'
    case 'oneTime':
      return 'One Time'
    case 'objective':
      return 'Objective'
    case 'builtIn':
      return 'Built-in'
    case 'predicate':
      return 'Custom'
  }
}

const formatTriggerDisplay = (cue: ICueDto): JSX.Element | string => {
  const trigger = cue.trigger
  switch (trigger.kind) {
    case 'interval':
      return `Every ${trigger.seconds} seconds`
    case 'oneTime':
      return `At ${formatSeconds(trigger.at)}`
    case 'objective': {
      const objectiveName = trigger.objective.charAt(0).toUpperCase() + trigger.objective.slice(1)
      return (
        <>
          {trigger.secondsBefore} seconds before{' '}
          <span className="font-semibold text-premium bg-premium/10 px-2 py-0.5 rounded-md">
            {objectiveName}
          </span>{' '}
          spawns
        </>
      )
    }
    case 'builtIn':
      return describeBuiltIn(trigger.id)
    case 'predicate':
      return `When ${describePredicate(trigger.predicate)}${describeFiring(trigger.firing)}`
  }
}

export function ActivePackPage(): JSX.Element {
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [cueToDelete, setCueToDelete] = useState<string | null>(null)
  const [cueToEdit, setCueToEdit] = useState<ICueDto | null>(null)
  const { isOpen, onOpen, onClose } = useModal()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useModal()
  const { cues, activePack } = useLoaderData<LoaderData>()
  const { revalidate } = useRevalidator()
  const toast = useToast()

  const getCueColor = (): string => {
    return 'border-border-primary'
  }

  const handleCreateCue = async (data: CreateCueDto): Promise<void> => {
    if (!activePack) {
      toast.error('No active pack selected')
      return
    }

    try {
      setIsCreating(true)
      await window.api.app.addCue(data)
      onClose()
      revalidate()
      toast.success('Cue created successfully')
    } catch (error) {
      console.error('Failed to create cue:', error)
      toast.error(`Failed to create cue: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsCreating(false)
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

  const openEditModal = (cue: ICueDto): void => {
    setCueToEdit(cue)
    onEditOpen()
  }

  const closeEditModal = (): void => {
    setCueToEdit(null)
    onEditClose()
  }

  const handleEditCue = async (data: CreateCueDto): Promise<void> => {
    if (!cueToEdit || !activePack) {
      return
    }

    try {
      setIsCreating(true)
      const editData: EditCueDto = {
        packId: activePack.id,
        text: data.text,
        trigger: data.trigger,
        endTime: data.endTime
      }
      await window.api.app.editCue(cueToEdit.id, editData)
      closeEditModal()
      revalidate()
      toast.success('Cue updated successfully')
    } catch (error) {
      console.error('Failed to update cue:', error)
      toast.error(`Failed to update cue: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between h-20 p-8 border-b border-border-primary">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-text-primary">Active Pack</h1>
          {activePack && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-info/10 border border-info/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-info"></div>
              <span className="text-sm font-medium text-info">{activePack.name}</span>
            </div>
          )}
        </div>

        <Button onClick={onOpen} size="md" disabled={!activePack}>
          <Plus size={16} className="mr-2" />
          Add Cue
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-8">
        {!activePack ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              title="No active pack"
              subtitle="Go to Packs to create and activate a cue pack"
              icon={<Bell size={32} className="text-text-tertiary" />}
            />
          </div>
        ) : cues.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              title="No cues in this pack"
              subtitle="Add your first cue to get started"
              icon={<Bell size={32} className="text-text-tertiary" />}
            />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cues.map((cue) => (
                <div
                  key={cue.id}
                  className={`relative border rounded-lg bg-bg-secondary ${getCueColor()} hover:shadow-md transition-shadow min-h-[200px] flex flex-col`}
                >
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-bg-primary rounded-lg flex items-center justify-center border border-border-primary/20">
                          {getCueIcon(cue.trigger)}
                        </div>
                        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider bg-bg-primary px-2.5 py-1 rounded-md">
                          {getTriggerTypeLabel(cue.trigger)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => window.api.app.playCue(cue.id)}
                          className="p-1.5 rounded-md hover:bg-bg-primary/50 transition-colors z-10"
                          aria-label="Play cue"
                        >
                          <Play className="w-4 h-4 text-text-tertiary hover:text-text-secondary" />
                        </button>
                        <button
                          onClick={() => openEditModal(cue)}
                          className="p-1.5 rounded-md hover:bg-bg-primary/50 transition-colors z-10"
                          aria-label="Edit cue"
                        >
                          <Pencil className="w-4 h-4 text-text-tertiary hover:text-text-secondary" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirmation(cue.id)}
                          className="p-1.5 rounded-md hover:bg-bg-primary/50 transition-colors z-10"
                          aria-label="Remove cue"
                        >
                          <X className="w-4 h-4 text-text-tertiary hover:text-text-secondary" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <h3 className="text-text-primary font-medium text-base leading-relaxed break-words min-h-[3rem]">
                        {cue.text}
                      </h3>

                      <div className="pt-3 border-t border-border-primary/10 mt-4 space-y-2.5">
                        <div className="flex items-start space-x-2.5 text-text-secondary">
                          <Timer className="w-4 h-4 text-text-tertiary mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-medium leading-relaxed">
                            {formatTriggerDisplay(cue)}
                          </span>
                        </div>
                        {cue.endTime !== undefined && (
                          <div className="flex items-start space-x-2.5 text-text-secondary">
                            <Clock className="w-4 h-4 text-text-tertiary mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium leading-relaxed">
                              Ends at {formatSeconds(cue.endTime)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose} title="Create New Cue" fullscreen>
        {activePack && (
          <CreateCueForm
            onSubmit={handleCreateCue}
            onCancel={onClose}
            activePackId={activePack.id}
            isLoading={isCreating}
          />
        )}
      </Modal>

      <Modal isOpen={isEditOpen} onClose={closeEditModal} title="Edit Cue" fullscreen>
        {activePack && cueToEdit && (
          <CreateCueForm
            onSubmit={handleEditCue}
            onCancel={closeEditModal}
            activePackId={activePack.id}
            isLoading={isCreating}
            initialValues={cueToEdit}
          />
        )}
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
