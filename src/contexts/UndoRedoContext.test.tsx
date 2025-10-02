import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { UndoRedoProvider, useUndoRedo } from './UndoRedoContext'
import { Command } from '../types/command'

// Mock command for testing
class MockCommand implements Command {
  public executed = false
  public undone = false
  public description: string

  constructor(description: string = 'Mock Command') {
    this.description = description
  }

  execute(): void {
    this.executed = true
    this.undone = false
  }

  undo(): void {
    this.undone = true
    this.executed = false
  }
}

describe('UndoRedoContext', () => {
  it('should provide undo/redo context', () => {
    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: UndoRedoProvider,
    })

    expect(result.current).toBeDefined()
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('should execute command', () => {
    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: UndoRedoProvider,
    })

    const command = new MockCommand()

    act(() => {
      result.current.executeCommand(command)
    })

    expect(command.executed).toBe(true)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should undo command', () => {
    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: UndoRedoProvider,
    })

    const command = new MockCommand()

    act(() => {
      result.current.executeCommand(command)
    })

    expect(result.current.canUndo).toBe(true)

    act(() => {
      result.current.undo()
    })

    expect(command.undone).toBe(true)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('should redo command', () => {
    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: UndoRedoProvider,
    })

    const command = new MockCommand()

    act(() => {
      result.current.executeCommand(command)
      result.current.undo()
    })

    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.redo()
    })

    expect(command.executed).toBe(true)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should handle multiple commands', () => {
    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: UndoRedoProvider,
    })

    const command1 = new MockCommand('Command 1')
    const command2 = new MockCommand('Command 2')

    act(() => {
      result.current.executeCommand(command1)
      result.current.executeCommand(command2)
    })

    expect(result.current.canUndo).toBe(true)

    act(() => {
      result.current.undo()
    })

    expect(command2.undone).toBe(true)
    expect(command1.executed).toBe(true)

    act(() => {
      result.current.undo()
    })

    expect(command1.undone).toBe(true)
    expect(result.current.canUndo).toBe(false)
  })

  it('should clear redo history when new command is executed', () => {
    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: UndoRedoProvider,
    })

    const command1 = new MockCommand('Command 1')
    const command2 = new MockCommand('Command 2')

    act(() => {
      result.current.executeCommand(command1)
      result.current.undo()
    })

    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.executeCommand(command2)
    })

    expect(result.current.canRedo).toBe(false)
  })

  it('should clear all history', () => {
    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: UndoRedoProvider,
    })

    const command = new MockCommand()

    act(() => {
      result.current.executeCommand(command)
    })

    expect(result.current.canUndo).toBe(true)

    act(() => {
      result.current.clearHistory()
    })

    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('should respect max history size', () => {
    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => (
        <UndoRedoProvider maxHistorySize={2}>{children}</UndoRedoProvider>
      ),
    })

    const command1 = new MockCommand('Command 1')
    const command2 = new MockCommand('Command 2')
    const command3 = new MockCommand('Command 3')

    act(() => {
      result.current.executeCommand(command1)
      result.current.executeCommand(command2)
      result.current.executeCommand(command3)
    })

    // Should only keep last 2 commands
    const history = result.current.getHistory?.() || []
    expect(history.length).toBe(2)
    expect(history[0].description).toBe('Command 2')
    expect(history[1].description).toBe('Command 3')
  })

  it('should not undo when canUndo is false', () => {
    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: UndoRedoProvider,
    })

    expect(result.current.canUndo).toBe(false)

    act(() => {
      result.current.undo()
    })

    // Should not throw error
    expect(result.current.canUndo).toBe(false)
  })

  it('should not redo when canRedo is false', () => {
    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: UndoRedoProvider,
    })

    expect(result.current.canRedo).toBe(false)

    act(() => {
      result.current.redo()
    })

    // Should not throw error
    expect(result.current.canRedo).toBe(false)
  })
})

