/**
 * Privacy-respecting daily launch tracking.
 * Sends a single ping per day to track app usage without collecting personal data.
 */

const STORAGE_KEY = 'lastLaunchPingDate'
const PING_URL = 'https://ping.leaguedex.app'
const PING_URL_DEV = 'http://localhost:5005/ping'

/**
 * Gets the current date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * Checks if we should send a ping (new day or no previous ping)
 */
function shouldSendPing(): boolean {
  const lastPingDate = localStorage.getItem(STORAGE_KEY)
  const today = getTodayDateString()

  // Send ping if no previous date exists or if it's a different day
  return !lastPingDate || lastPingDate !== today
}

/**
 * Sends a ping to the tracking endpoint with app version
 */
async function sendPing(version: string): Promise<void> {
  const today = getTodayDateString()

  try {
    const response = await fetch(import.meta.env.DEV ? PING_URL_DEV : PING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: version
      })
    })

    // Only update localStorage if the request was successful
    if (response.ok) {
      localStorage.setItem(STORAGE_KEY, today)
    }
  } catch {
    // Silently fail - don't interrupt user experience
    // Errors are ignored to maintain privacy and not expose tracking failures
  }
}

/**
 * Initializes daily launch tracking.
 * Should be called once when the app starts.
 */
export async function trackDailyLaunch(): Promise<void> {
  // Check if we should send a ping
  if (!shouldSendPing()) {
    return
  }

  // Get app version and send ping
  try {
    const version = await window.api.getVersion()
    await sendPing(version)
  } catch {
    // Silently fail if version retrieval fails
  }
}
