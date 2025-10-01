import { useState } from 'react'
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

  return (
    <SelectionProvider>
      <div className="app">
        <header className="app-header">
          <h1>SVG Editor</h1>
          {fileName && (
            <div className="file-info">
              <span className="file-name">{fileName}</span>
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

