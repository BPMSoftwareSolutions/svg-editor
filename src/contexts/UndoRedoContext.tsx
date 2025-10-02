import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { Command, UndoRedoContextType, UndoRedoState } from '../types/command'

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(undefined)

interface UndoRedoProviderProps {
  children: ReactNode
  maxHistorySize?: number
}

export function UndoRedoProvider({ children, maxHistorySize = 50 }: UndoRedoProviderProps) {
  const [state, setState] = useState<UndoRedoState>({
    history: [],
    currentIndex: -1,
    maxHistorySize,
  })

  // Calculate derived state
  const canUndo = state.currentIndex >= 0
  const canRedo = state.currentIndex < state.history.length - 1

  /**
   * Execute a new command and add it to history
   */
  const executeCommand = useCallback((command: Command) => {
    // Execute the command
    command.execute()

    setState(prevState => {
      // Remove any commands after current index (they become invalid after new command)
      const newHistory = prevState.history.slice(0, prevState.currentIndex + 1)
      
      // Add new command
      newHistory.push(command)

      // Trim history if it exceeds max size
      const trimmedHistory = newHistory.length > prevState.maxHistorySize
        ? newHistory.slice(newHistory.length - prevState.maxHistorySize)
        : newHistory

      return {
        ...prevState,
        history: trimmedHistory,
        currentIndex: trimmedHistory.length - 1,
      }
    })
  }, [])

  /**
   * Undo the last command
   */
  const undo = useCallback(() => {
    setState(prevState => {
      if (prevState.currentIndex < 0) return prevState

      const command = prevState.history[prevState.currentIndex]
      command.undo()

      return {
        ...prevState,
        currentIndex: prevState.currentIndex - 1,
      }
    })
  }, [])

  /**
   * Redo the next command
   */
  const redo = useCallback(() => {
    setState(prevState => {
      if (prevState.currentIndex >= prevState.history.length - 1) return prevState

      const command = prevState.history[prevState.currentIndex + 1]
      command.execute()

      return {
        ...prevState,
        currentIndex: prevState.currentIndex + 1,
      }
    })
  }, [])

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      history: [],
      currentIndex: -1,
    }))
  }, [])

  /**
   * Get current history (for debugging)
   */
  const getHistory = useCallback(() => {
    return state.history
  }, [state.history])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl+Y or Cmd+Shift+Z for redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault()
        redo()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return (
    <UndoRedoContext.Provider
      value={{
        canUndo,
        canRedo,
        undo,
        redo,
        executeCommand,
        clearHistory,
        getHistory,
      }}
    >
      {children}
    </UndoRedoContext.Provider>
  )
}

export function useUndoRedo() {
  const context = useContext(UndoRedoContext)
  if (context === undefined) {
    throw new Error('useUndoRedo must be used within an UndoRedoProvider')
  }
  return context
}

