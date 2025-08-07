import { Plus, X } from 'lucide-react'
import { useState, type JSX } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onOpen(): void
  onCreate(): void
}

type FormState = {
  message: string
  timeInput: string
  isRepeating: boolean
}

export function AddReminderModal({ isOpen, onClose, onOpen, onCreate }: Props): JSX.Element {
  const [state, setState] = useState<FormState>({
    isRepeating: false,
    message: '',
    timeInput: ''
  })

  function parseTimeToSeconds(timeInput: string): number {
    if (!timeInput.trim()) return 0

    if (timeInput.includes(':')) {
      const parts = timeInput.split(':')
      if (parts.length === 2) {
        const minutes = parseInt(parts[0]) || 0
        const seconds = parseInt(parts[1]) || 0
        return minutes * 60 + seconds
      }
    }

    const totalSeconds = parseInt(timeInput) || 0
    return totalSeconds
  }

  function formatSecondsToTime(seconds: number): string {
    if (seconds === 0) return ''

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes === 0) {
      return seconds.toString() + 's'
    } else if (remainingSeconds === 0) {
      return minutes.toString() + 'm'
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }

  async function onAdd(event: React.MouseEvent): Promise<void> {
    event.preventDefault()

    const seconds = parseTimeToSeconds(state.timeInput)
    if (seconds === 0) return

    try {
      await window.api.gameAssistant.addReminder({
        time: seconds,
        type: state.isRepeating ? 'repeating' : 'one-time',
        message: state.message
      })
      onCreate()

      setState({
        isRepeating: false,
        message: '',
        timeInput: ''
      })
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error creating reminder'
      window.alert(message)
      console.error(err)
    }
  }

  function handleTimeChange(value: string): void {
    const sanitizedValue = value.replace(/[^0-9:]/g, '')

    const colonCount = (sanitizedValue.match(/:/g) || []).length
    if (colonCount > 1) return

    if (sanitizedValue.includes(':')) {
      const parts = sanitizedValue.split(':')
      if (parts.length === 2) {
        const seconds = parts[1]

        if (seconds.length > 2 || parseInt(seconds) > 59) return
      }
    }

    setState({ ...state, timeInput: sanitizedValue })
  }

  return (
    <div>
      <button
        onClick={onOpen}
        className="w-full p-4 mt-6 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] rounded-md text-success text-sm cursor-pointer transition-all duration-200 hover:bg-[rgba(0,255,136,0.15)] flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add Reminder
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-secondary/65 backdrop-blur-md" onClick={onClose} />

          <div className="relative z-10 w-[420px] bg-bg-secondary rounded-xl shadow-2xl border border-border-primary">
            <div className="flex items-center justify-between p-6 pb-6 border-b border-border-primary">
              <h2 className="text-lg font-semibold text-text-primary">Add Reminder</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] rounded-lg text-text-tertiary hover:text-text-secondary transition-all duration-200 flex items-center justify-center"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 pb-8 flex flex-col gap-8">
              <div className="flex gap-2">
                <button
                  onClick={() => setState({ ...state, isRepeating: false })}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    !state.isRepeating
                      ? 'bg-[rgba(0,255,136,0.1)] border border-success text-success'
                      : 'bg-bg-primary border border-border-secondary text-text-secondary hover:bg-[rgba(255,255,255,0.05)] hover:border-border-primary'
                  }`}
                >
                  One-time
                </button>
                <button
                  onClick={() => setState({ ...state, isRepeating: true })}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    state.isRepeating
                      ? 'bg-[rgba(0,255,136,0.1)] border border-success text-success'
                      : 'bg-bg-primary border border-border-secondary text-text-secondary hover:bg-[rgba(255,255,255,0.05)] hover:border-border-primary'
                  }`}
                >
                  Repeating
                </button>
              </div>

              <div>
                <label className="block mb-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={state.timeInput}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    placeholder="e.g. 120, 2:30, 90"
                    className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-lg text-text-primary text-sm transition-all duration-200 focus:outline-none focus:border-success focus:bg-bg-primary focus:shadow-[0_0_0_3px_rgba(0,255,136,0.1)]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary text-xs pointer-events-none">
                    {state.timeInput
                      ? formatSecondsToTime(parseTimeToSeconds(state.timeInput))
                      : 'time'}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mt-1.5">
                  Enter time as seconds (120) or MM:SS format (2:30). 120 = 2 minutes, 90 = 1:30.
                </p>
              </div>

              <div>
                <label className="block mb-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Message
                </label>
                <input
                  type="text"
                  value={state.message}
                  onChange={(e) => setState({ ...state, message: e.target.value })}
                  placeholder="e.g. Check minimap, Ward pixel brush"
                  className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-lg text-text-primary text-sm transition-all duration-200 focus:outline-none focus:border-success focus:bg-bg-primary focus:shadow-[0_0_0_3px_rgba(0,255,136,0.1)]"
                />
                <p className="text-xs text-text-tertiary mt-1.5">
                  What should we remind you about?
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border-primary">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-6 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-border-secondary hover:border-border-primary rounded-lg text-text-secondary hover:text-text-primary text-sm font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={onAdd}
                disabled={!state.message.trim() || !state.timeInput.trim()}
                className="flex-1 py-3 px-6 bg-success hover:bg-[#00cc70] border border-success hover:border-[#00cc70] rounded-lg text-text-inverse text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-success"
              >
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
