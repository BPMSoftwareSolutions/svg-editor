import { useState, useEffect } from 'react'
import { SelectionProvider } from './contexts/SelectionContext'
import FileUploader from './components/FileUploader'
import SVGViewer from './components/SVGViewer'
import './styles/App.css'

function App() {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')

  const handleFileLoad = (content: string, name: string) => {
    setSvgContent(content)
    setFileName(name)
  }

  const handleClear = () => {
    setSvgContent(null)
    setFileName('')
  }

  const handleExport = () => {
    // Get current SVG content from DOM (includes all modifications)
    const svgElement = document.querySelector('.svg-content svg')
    if (!svgElement) return

    const svgString = new XMLSerializer().serializeToString(svgElement)

    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'edited-svg.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (svgContent) {
          handleExport()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [svgContent, fileName])

  return (
    <SelectionProvider>
      <div className="app">
        <header className="app-header">
          <h1>SVG Editor</h1>
          {fileName && (
            <div className="file-info">
              <span className="file-name">{fileName}</span>
              <button onClick={handleExport} className="export-button" title="Save SVG (Ctrl+S)">
                💾 Save SVG
              </button>
              <button onClick={handleClear} className="clear-button">
                Clear
              </button>
            </div>
          )}
        </header>
        <main className="app-main">
          {!svgContent ? (
            <FileUploader onFileLoad={handleFileLoad} />
          ) : (
            <SVGViewer svgContent={svgContent} />
          )}
        </main>
      </div>
    </SelectionProvider>
  )
}

export default App

