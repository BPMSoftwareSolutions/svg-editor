import { useRef, useState, DragEvent, ChangeEvent } from 'react'
import { MultiFileUploaderProps, SVGAsset } from '../types/asset'
import '../styles/FileUploader.css'

// Extend props to support both single and multi-file modes
interface FileUploaderProps extends Partial<MultiFileUploaderProps> {
  onFileLoad?: (content: string, fileName: string) => void
}

function FileUploader({
  onFileLoad,
  onFilesLoad,
  maxFiles,
  multiple = false
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      // If only one file and onFileLoad is provided, use single-file mode
      if (files.length === 1 && onFileLoad) {
        processFile(files[0])
      } else if (multiple && onFilesLoad) {
        processFiles(files)
      } else {
        processFile(files[0])
      }
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // If only one file and onFileLoad is provided, use single-file mode
      if (files.length === 1 && onFileLoad) {
        processFile(files[0])
      } else if (multiple && onFilesLoad) {
        processFiles(Array.from(files))
      } else {
        processFile(files[0])
      }
    }
  }

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.svg')) {
      alert('Please select an SVG file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (onFileLoad) {
        onFileLoad(content, file.name)
      }
    }
    reader.onerror = () => {
      alert('Error reading file')
    }
    reader.readAsText(file)
  }

  const processFiles = async (files: File[]) => {
    // Filter SVG files only
    const svgFiles = files.filter(file => file.name.toLowerCase().endsWith('.svg'))

    if (svgFiles.length === 0) {
      alert('Please select at least one SVG file')
      return
    }

    // Check max files limit
    if (maxFiles && svgFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. Only the first ${maxFiles} will be imported.`)
      svgFiles.splice(maxFiles)
    }

    setIsProcessing(true)
    setProgress({ current: 0, total: svgFiles.length })

    const assets: Omit<SVGAsset, 'id' | 'importedAt'>[] = []
    const cascadeOffset = 20 // Default cascade offset

    for (let i = 0; i < svgFiles.length; i++) {
      const file = svgFiles[i]

      try {
        const content = await readFileAsText(file)

        // Create asset with default positioning (cascade)
        const asset: Omit<SVGAsset, 'id' | 'importedAt'> = {
          name: file.name,
          content,
          position: {
            x: i * cascadeOffset,
            y: i * cascadeOffset,
          },
          scale: 1,
          zIndex: i,
          visible: true,
          rotation: 0,
          opacity: 1,
        }

        assets.push(asset)
        setProgress({ current: i + 1, total: svgFiles.length })
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error)
        alert(`Error reading file ${file.name}`)
      }
    }

    setIsProcessing(false)
    setProgress({ current: 0, total: 0 })

    // Call the callback with all loaded assets
    if (onFilesLoad && assets.length > 0) {
      onFilesLoad(assets)
    }
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = () => {
        reject(new Error('Error reading file'))
      }
      reader.readAsText(file)
    })
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`file-uploader ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={!isProcessing ? handleClick : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        multiple={multiple}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={isProcessing}
      />
      <div className="upload-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      {isProcessing ? (
        <>
          <h2>Importing files...</h2>
          <p>{progress.current} of {progress.total} files</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <h2>Drop SVG file{multiple ? 's' : ''} here</h2>
          <p>or click to browse{multiple && maxFiles ? ` (max ${maxFiles} files)` : ''}</p>
        </>
      )}
    </div>
  )
}

export default FileUploader

