const STORAGE_KEY = 'loan-app-latest-entry'

const defaultEntry = {
  mobileNumber: '',
  pin: '',
  otp: '',
}

export function getLatestEntry() {
  if (typeof window === 'undefined') {
    return defaultEntry
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return defaultEntry
    }

    return { ...defaultEntry, ...JSON.parse(storedValue) }
  } catch {
    return defaultEntry
  }
}

export function saveLatestEntry(nextEntry) {
  if (typeof window === 'undefined') {
    return
  }

  const currentEntry = getLatestEntry()
  const mergedEntry = { ...currentEntry, ...nextEntry }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedEntry))
}