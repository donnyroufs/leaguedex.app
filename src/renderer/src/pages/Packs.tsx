import { JSX, useState } from 'react'
import { Package, Plus, Users, Target, Crown, Trash2, Download, Share } from 'lucide-react'
import { PageWrapper } from '../components/PageWrapper'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { useModal, useToast } from '../hooks'
import { EmptyState } from '@renderer/components/EmptyState'
import { useLoaderData, useRevalidator } from 'react-router'
import { ConfirmDialog } from '@renderer/components/ConfirmDialog'
import { ICuePackDto, CreateCuePackDto } from '@hexagon/index'

type LoaderData = {
  cuePacks: ICuePackDto[]
  activePack: ICuePackDto | null
}

export function PacksPage(): JSX.Element {
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [packName, setPackName] = useState<string>('')
  const [importCode, setImportCode] = useState<string>('')
  const [packToDelete, setPackToDelete] = useState<string | null>(null)
  const [exportingPacks, setExportingPacks] = useState<Set<string>>(new Set())
  const { isOpen, onOpen, onClose } = useModal()
  const { isOpen: isImportOpen, onOpen: onImportOpen, onClose: onImportClose } = useModal()
  const { cuePacks, activePack } = useLoaderData<LoaderData>()
  const { revalidate } = useRevalidator()
  const toast = useToast()

  const handleCreatePack = async (): Promise<void> => {
    if (!packName.trim()) {
      toast.error('Pack name is required')
      return
    }

    try {
      setIsCreating(true)
      const data: CreateCuePackDto = { name: packName.trim() }
      await window.api.app.createCuePack(data)
      setPackName('')
      onClose()
      revalidate()
      toast.success('Pack created successfully')
    } catch (error) {
      console.error('Failed to create pack:', error)
      toast.error('Failed to create pack')
    } finally {
      setIsCreating(false)
    }
  }

  const handleImportPack = async (): Promise<void> => {
    if (!importCode.trim()) {
      toast.error('Import code is required')
      return
    }

    try {
      setIsImporting(true)
      await window.api.app.importPack(importCode.trim())
      setImportCode('')
      onImportClose()
      revalidate()
      toast.success('Pack imported successfully')
    } catch (error) {
      console.error('Failed to import pack:', error)
      toast.error('Failed to import pack')
    } finally {
      setIsImporting(false)
    }
  }

  const handleActivatePack = async (packId: string): Promise<void> => {
    try {
      await window.api.app.activateCuePack(packId)
      revalidate()
      toast.success('Pack activated successfully')
    } catch (error) {
      console.error('Failed to activate pack:', error)
      toast.error('Failed to activate pack')
    }
  }

  const handleExportPack = async (packId: string): Promise<void> => {
    try {
      setExportingPacks((prev) => new Set(prev).add(packId))
      const exportCode = await window.api.app.exportPack(packId)
      await navigator.clipboard.writeText(exportCode)
      toast.success('Pack exported and copied to clipboard')
    } catch (error) {
      console.error('Failed to export pack:', error)
      toast.error('Failed to export pack')
    } finally {
      setExportingPacks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(packId)
        return newSet
      })
    }
  }

  const openDeleteConfirmation = (packId: string): void => {
    setPackToDelete(packId)
  }

  const closeDeleteConfirmation = (): void => {
    setPackToDelete(null)
  }

  const handleDeletePack = async (packId: string): Promise<void> => {
    try {
      await window.api.app.removeCuePack(packId)
      toast.success('Pack deleted successfully')
      revalidate()
    } catch (error) {
      console.error('Failed to delete pack:', error)
      toast.error('Failed to delete pack')
    }
  }

  const confirmDelete = (): void => {
    if (packToDelete) {
      handleDeletePack(packToDelete)
      closeDeleteConfirmation()
    }
  }

  const handleModalClose = (): void => {
    setPackName('')
    onClose()
  }

  const handleImportModalClose = (): void => {
    setImportCode('')
    onImportClose()
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between h-20 p-8 border-b border-border-primary">
        <h1 className="text-2xl font-semibold text-text-primary">Cue Packs</h1>
        <div className="flex gap-3">
          <Button onClick={onImportOpen} variant="secondary" size="md">
            <Download size={16} className="mr-2" />
            Import Pack
          </Button>
          <Button onClick={onOpen} size="md">
            <Plus size={16} className="mr-2" />
            Create Pack
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-8">
        {cuePacks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              title="No cue packs"
              subtitle="Create your first cue pack to get started"
              icon={<Package size={32} className="text-text-tertiary" />}
            />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cuePacks.map((pack) => {
                const isActive = activePack?.id === pack.id
                return (
                  <div
                    key={pack.id}
                    className={`relative border rounded-lg bg-bg-secondary transition-all duration-200 ${
                      isActive
                        ? 'border-info border-1 bg-info/5'
                        : 'border-border-primary hover:border-border-accent hover:bg-bg-tertiary'
                    }`}
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => openDeleteConfirmation(pack.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-bg-primary/50 transition-colors"
                      aria-label="Delete pack"
                    >
                      <Trash2 className="w-4 h-4 text-text-tertiary hover:text-status-danger" />
                    </button>

                    {/* Export button */}
                    <button
                      onClick={() => handleExportPack(pack.id)}
                      disabled={exportingPacks.has(pack.id)}
                      className="absolute top-2 right-9 p-1.5 rounded-md hover:bg-bg-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Export pack"
                    >
                      <Share className="w-4 h-4 text-text-tertiary hover:text-info" />
                    </button>

                    <div className="p-6">
                      {/* Header with icon and active indicator */}
                      <div className="flex items-center space-x-4 mb-6">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${
                            isActive
                              ? 'bg-info/10 border-info'
                              : 'bg-bg-primary border-border-primary/20'
                          }`}
                        >
                          {isActive ? (
                            <Crown className="w-6 h-6 text-info" />
                          ) : (
                            <Package className="w-6 h-6 text-text-tertiary" />
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <h3 className="text-text-primary font-semibold text-lg leading-tight break-words max-w-[14ch]">
                            {pack.name}
                          </h3>
                        </div>
                      </div>

                      {/* Pack details */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2.5 text-text-secondary">
                          <Target className="w-3.5 h-3.5 text-text-tertiary" />
                          <span className="text-sm font-medium">
                            {pack.cues.length} {pack.cues.length === 1 ? 'cue' : 'cues'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t border-border-primary/20">
                        <Button
                          onClick={() => handleActivatePack(pack.id)}
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          disabled={isActive}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {isActive ? 'Currently Active' : 'Activate Pack'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Pack Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose} title="Create New Pack">
        <div className="space-y-6">
          <div>
            <label htmlFor="pack-name" className="block text-sm font-medium text-text-primary mb-2">
              Pack Name
            </label>
            <input
              id="pack-name"
              type="text"
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              placeholder="e.g., Mid Lane Fundamentals, Support Rotations..."
              className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-info/20 focus:border-info/40 transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreatePack()
                }
              }}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border-primary/20">
            <Button
              type="button"
              variant="secondary"
              onClick={handleModalClose}
              disabled={isCreating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePack}
              disabled={!packName.trim() || isCreating}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Create Pack'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Pack Modal */}
      <Modal isOpen={isImportOpen} onClose={handleImportModalClose} title="Import Pack">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="import-code"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Import Code
            </label>
            <textarea
              id="import-code"
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Paste your pack import code here..."
              rows={4}
              className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-info/20 focus:border-info/40 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border-primary/20">
            <Button
              type="button"
              variant="secondary"
              onClick={handleImportModalClose}
              disabled={isImporting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportPack}
              disabled={!importCode.trim() || isImporting}
              className="flex-1"
            >
              {isImporting ? 'Importing...' : 'Import Pack'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={packToDelete !== null}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        title="Delete Pack"
        message="Are you sure you want to delete this pack? All cues in this pack will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </PageWrapper>
  )
}
