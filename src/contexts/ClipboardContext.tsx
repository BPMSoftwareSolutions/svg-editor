import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { SerializedElement, serializeElement } from '../utils/clipboard'

interface ClipboardContextType {
  /**
   * Serialized element data stored in clipboard
   */
  copiedElements: SerializedElement[]

  /**
   * Copy elements to clipboard
   */
  copyElements: (elements: SVGElement[]) => void

  /**
   * Get copied elements
   */
  getCopiedElements: () => SerializedElement[]

  /**
   * Check if clipboard has elements
   */
  hasCopiedElements: boolean

  /**
   * Clear clipboard
   */
  clearClipboard: () => void

  /**
   * Paste count for calculating offsets
   */
  pasteCount: number

  /**
   * Increment paste count
   */
  incrementPasteCount: () => void

  /**
   * Reset paste count
   */
  resetPasteCount: () => void
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined)

export function ClipboardProvider({ children }: { children: ReactNode }) {
  const [copiedElements, setCopiedElements] = useState<SerializedElement[]>([])
  const [pasteCount, setPasteCount] = useState(0)

  const copyElements = useCallback((elements: SVGElement[]) => {
    if (elements.length === 0) {
      console.log('[ClipboardContext] No elements to copy')
      return
    }

    const serialized = elements.map(el => serializeElement(el))
    setCopiedElements(serialized)
    setPasteCount(0) // Reset paste count when copying new elements
    
    console.log('[ClipboardContext] Copied elements:', serialized.length)
  }, [])

  const getCopiedElements = useCallback(() => {
    return copiedElements
  }, [copiedElements])

  const clearClipboard = useCallback(() => {
    setCopiedElements([])
    setPasteCount(0)
    console.log('[ClipboardContext] Clipboard cleared')
  }, [])

  const incrementPasteCount = useCallback(() => {
    setPasteCount(prev => prev + 1)
  }, [])

  const resetPasteCount = useCallback(() => {
    setPasteCount(0)
  }, [])

  const hasCopiedElements = copiedElements.length > 0

  return (
    <ClipboardContext.Provider
      value={{
        copiedElements,
        copyElements,
        getCopiedElements,
        hasCopiedElements,
        clearClipboard,
        pasteCount,
        incrementPasteCount,
        resetPasteCount,
      }}
    >
      {children}
    </ClipboardContext.Provider>
  )
}

export function useClipboard() {
  const context = useContext(ClipboardContext)
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider')
  }
  return context
}

