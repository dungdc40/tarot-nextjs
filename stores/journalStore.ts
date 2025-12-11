// Journal Store - Manages reading history and saved sessions
// Uses Zustand for local state and React Query for server state

import { create } from 'zustand'
import type { JournalEntry, JournalEntryListItem } from '@/types'

interface JournalStore {
  // State
  selectedEntry: JournalEntry | null
  searchQuery: string
  sortBy: 'date' | 'intention'
  sortOrder: 'asc' | 'desc'

  // Actions
  setSelectedEntry: (entry: JournalEntry | null) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sortBy: 'date' | 'intention') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  toggleSortOrder: () => void
  clearSearch: () => void
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  // Initial state
  selectedEntry: null,
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc',

  setSelectedEntry: (entry) => {
    set({ selectedEntry: entry })
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery })
  },

  setSortBy: (sortBy) => {
    set({ sortBy })
  },

  setSortOrder: (sortOrder) => {
    set({ sortOrder })
  },

  toggleSortOrder: () => {
    const { sortOrder } = get()
    set({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' })
  },

  clearSearch: () => {
    set({ searchQuery: '' })
  },
}))

// Helper functions for filtering and sorting
export const filterEntries = (
  entries: JournalEntryListItem[],
  searchQuery: string
): JournalEntryListItem[] => {
  if (!searchQuery.trim()) return entries

  const query = searchQuery.toLowerCase()
  return entries.filter(
    (entry) =>
      entry.intention.toLowerCase().includes(query) ||
      entry.topic?.toLowerCase().includes(query)
  )
}

export const sortEntries = (
  entries: JournalEntryListItem[],
  sortBy: 'date' | 'intention',
  sortOrder: 'asc' | 'desc'
): JournalEntryListItem[] => {
  const sorted = [...entries].sort((a, b) => {
    if (sortBy === 'date') {
      return a.createdAt.getTime() - b.createdAt.getTime()
    } else {
      return a.intention.localeCompare(b.intention)
    }
  })

  return sortOrder === 'desc' ? sorted.reverse() : sorted
}

// Selectors for filtered and sorted entries
export const useFilteredEntries = (entries: JournalEntryListItem[]) => {
  return useJournalStore((state) => {
    const filtered = filterEntries(entries, state.searchQuery)
    return sortEntries(filtered, state.sortBy, state.sortOrder)
  })
}
