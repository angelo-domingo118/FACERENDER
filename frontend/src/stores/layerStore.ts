import { create } from 'zustand'
import { Layer } from '@/types/composite'

interface LayerHistoryState {
  layers: Layer[]
  history: Layer[][]
  currentIndex: number
  maxHistory: number
  // Actions
  setLayers: (layers: Layer[]) => void
  pushHistory: (layers: Layer[]) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export const useLayerStore = create<LayerHistoryState>((set, get) => ({
  layers: [],
  history: [],
  currentIndex: -1,
  maxHistory: 50, // Maximum number of history states to keep

  setLayers: (layers) => {
    set({ layers: [...layers] })
  },

  pushHistory: (layers) => {
    const { history, currentIndex, maxHistory } = get()
    
    // Remove any future history if we're not at the latest state
    const newHistory = history.slice(0, currentIndex + 1)
    
    // Add new state
    newHistory.push([...layers])
    
    // Remove oldest states if exceeding maxHistory
    while (newHistory.length > maxHistory) {
      newHistory.shift()
    }

    set({
      history: newHistory,
      currentIndex: newHistory.length - 1
    })
  },

  undo: () => {
    const { history, currentIndex } = get()
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      set({
        layers: [...history[newIndex]],
        currentIndex: newIndex
      })
    }
  },

  redo: () => {
    const { history, currentIndex } = get()
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      set({
        layers: [...history[newIndex]],
        currentIndex: newIndex
      })
    }
  },

  canUndo: () => {
    const { currentIndex } = get()
    return currentIndex > 0
  },

  canRedo: () => {
    const { history, currentIndex } = get()
    return currentIndex < history.length - 1
  }
})) 