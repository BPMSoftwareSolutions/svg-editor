import { useState, useEffect, useCallback } from 'react'
import { SelectionProvider } from './contexts/SelectionContext'
import { UndoRedoProvider } from './contexts/UndoRedoContext'
import { AssetProvider, useAssets } from './contexts/AssetContext'
import { ClipboardProvider } from './contexts/ClipboardContext'
import { ViewportProvider } from './contexts/ViewportContext'
import { SVGAsset } from './types/asset'
import FileUploader from './components/FileUploader'
import SVGViewer from './components/SVGViewer'
import HeaderToolbar from './components/HeaderToolbar'
import './styles/App.css'

// Inner component that uses AssetContext
function AppContent() {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [useMultiAssetMode, setUseMultiAssetMode] = useState(false)
  const { assets, addAsset, clearAssets } = useAssets()

  const handleFileLoad = (content: string, name: string) => {
    // Single file mode - maintain backward compatibility
    setSvgContent(content)
    setFileName(name)
    setUseMultiAssetMode(false)
  }

  const handleFilesLoad = (assetData: Omit<SVGAsset, 'id' | 'importedAt'>[]) => {
    // Multi-file mode - use asset system
    clearAssets() // Clear existing assets
    assetData.forEach(asset => addAsset(asset))
    setUseMultiAssetMode(true)
    setSvgContent(null) // Clear single file content
    setFileName(`${assetData.length} assets`)
  }

  const handleClear = () => {
    setSvgContent(null)
    setFileName('')
    clearAssets()
    setUseMultiAssetMode(false)
  }

  const handleExport = useCallback(() => {
    // Get current SVG content from DOM (includes all modifications)
    const svgElement = document.querySelector('.svg-content svg')
    if (!svgElement) return

    const svgString = new XMLSerializer().serializeToString(svgElement)

    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // Use appropriate filename based on mode
    const downloadName = useMultiAssetMode
      ? 'composite-svg.svg'
      : (fileName || 'edited-svg.svg')

    link.download = downloadName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [useMultiAssetMode, fileName])

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (svgContent || assets.length > 0) {
          handleExport()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [svgContent, fileName, assets.length, useMultiAssetMode, handleExport])

  const hasContent = svgContent !== null || assets.length > 0

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>SVG Editor</h1>
          {fileName && (
            <span className="file-name">{fileName}</span>
          )}
        </div>
        {hasContent && (
          <HeaderToolbar onSave={handleExport} onClear={handleClear} />
        )}
      </header>
      <main className="app-main">
        {!hasContent ? (
          <FileUploader
            onFileLoad={handleFileLoad}
            onFilesLoad={handleFilesLoad}
            multiple={true}
            maxFiles={10}
          />
        ) : (
          <SVGViewer
            svgContent={svgContent || undefined}
            useAssetMode={useMultiAssetMode}
          />
        )}
      </main>
    </div>
  )
}

// Main App component with providers
function App() {
  return (
    <AssetProvider>
      <ViewportProvider>
        <SelectionProvider>
          <UndoRedoProvider>
            <ClipboardProvider>
              <AppContent />
            </ClipboardProvider>
          </UndoRedoProvider>
        </SelectionProvider>
      </ViewportProvider>
    </AssetProvider>
  )
}

export default App

