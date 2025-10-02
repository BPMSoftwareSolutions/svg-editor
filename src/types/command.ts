/**
 * Command Pattern Interface for Undo/Redo System
 * 
 * Each command represents a reversible operation on the SVG editor.
 * Commands must implement both execute() and undo() methods.
 */

export interface Command {
  /**
   * Execute the command (perform the operation)
   */
  execute(): void

  /**
   * Undo the command (reverse the operation)
   */
  undo(): void

  /**
   * Human-readable description of the command
   */
  description: string
}

/**
 * State interface for the Undo/Redo system
 */
export interface UndoRedoState {
  /**
   * Array of executed commands (history stack)
   */
  history: Command[]

  /**
   * Current position in the history stack
   * Points to the last executed command
   */
  currentIndex: number

  /**
   * Maximum number of commands to keep in history
   * Older commands are removed when this limit is exceeded
   */
  maxHistorySize: number
}

/**
 * Context type for the UndoRedo provider
 */
export interface UndoRedoContextType {
  /**
   * Whether undo operation is available
   */
  canUndo: boolean

  /**
   * Whether redo operation is available
   */
  canRedo: boolean

  /**
   * Perform undo operation
   */
  undo: () => void

  /**
   * Perform redo operation
   */
  redo: () => void

  /**
   * Execute a new command and add it to history
   */
  executeCommand: (command: Command) => void

  /**
   * Clear all history
   */
  clearHistory: () => void

  /**
   * Get the current history for debugging
   */
  getHistory?: () => Command[]
}

