import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FileUploader from './FileUploader'

describe('FileUploader - Single File Mode', () => {
  it('renders upload interface', () => {
    const mockOnFileLoad = vi.fn()
    render(<FileUploader onFileLoad={mockOnFileLoad} />)
    
    expect(screen.getByText('Drop SVG file here')).toBeInTheDocument()
    expect(screen.getByText('or click to browse')).toBeInTheDocument()
  })

  it('handles file selection', async () => {
    const mockOnFileLoad = vi.fn()
    render(<FileUploader onFileLoad={mockOnFileLoad} />)
    
    const svgContent = '<svg><circle cx="50" cy="50" r="40" /></svg>'
    const file = new File([svgContent], 'test.svg', { type: 'image/svg+xml' })
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
      result: svgContent,
    }
    
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader)

    fireEvent.change(input, { target: { files: [file] } })

    // Trigger the onload callback
    if (mockFileReader.onload) {
      const progressEvent = { target: mockFileReader } as unknown as ProgressEvent<FileReader>
      mockFileReader.onload.call(mockFileReader as unknown as FileReader, progressEvent)
    }
    
    expect(mockFileReader.readAsText).toHaveBeenCalledWith(file)
  })

  it('shows dragging state on drag enter', () => {
    const mockOnFileLoad = vi.fn()
    const { container } = render(<FileUploader onFileLoad={mockOnFileLoad} />)

    const uploader = container.querySelector('.file-uploader')!

    fireEvent.dragEnter(uploader)
    expect(uploader).toHaveClass('dragging')

    fireEvent.dragLeave(uploader)
    expect(uploader).not.toHaveClass('dragging')
  })
})

describe('FileUploader - Multi File Mode', () => {
  it('renders multi-file upload interface', () => {
    const mockOnFilesLoad = vi.fn()
    render(<FileUploader onFilesLoad={mockOnFilesLoad} multiple={true} />)

    expect(screen.getByText('Drop SVG files here')).toBeInTheDocument()
    expect(screen.getByText(/or click to browse/)).toBeInTheDocument()
  })

  it('shows max files limit in UI', () => {
    const mockOnFilesLoad = vi.fn()
    render(<FileUploader onFilesLoad={mockOnFilesLoad} multiple={true} maxFiles={5} />)

    expect(screen.getByText(/max 5 files/)).toBeInTheDocument()
  })

  it('handles multiple file selection', async () => {
    const mockOnFilesLoad = vi.fn()
    render(<FileUploader onFilesLoad={mockOnFilesLoad} multiple={true} />)

    const svgContent1 = '<svg><circle cx="50" cy="50" r="40" /></svg>'
    const svgContent2 = '<svg><rect x="10" y="10" width="80" height="80" /></svg>'

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('multiple')

    // Mock FileReader to immediately call onload
    vi.spyOn(window, 'FileReader').mockImplementation(() => {
      const mockReader = {
        readAsText: vi.fn(function(this: FileReader) {
          // Immediately trigger onload
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: this } as ProgressEvent<FileReader>)
            }
          }, 0)
        }),
        onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
        onerror: null,
        result: svgContent1,
      }
      return mockReader as unknown as FileReader
    })

    fireEvent.change(input, { target: { files: [
      new File([svgContent1], 'test1.svg', { type: 'image/svg+xml' }),
      new File([svgContent2], 'test2.svg', { type: 'image/svg+xml' }),
    ] } })

    // Wait for the async file processing to complete
    await waitFor(() => {
      expect(mockOnFilesLoad).toHaveBeenCalled()
    }, { timeout: 2000 })

    // Verify it was called with an array of assets
    expect(mockOnFilesLoad).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'test1.svg' }),
        expect.objectContaining({ name: 'test2.svg' }),
      ])
    )
  })

  it('shows progress during file processing', async () => {
    const mockOnFilesLoad = vi.fn()
    const { container } = render(<FileUploader onFilesLoad={mockOnFilesLoad} multiple={true} />)

    const svgContent = '<svg><circle cx="50" cy="50" r="40" /></svg>'
    const files = [
      new File([svgContent], 'test1.svg', { type: 'image/svg+xml' }),
      new File([svgContent], 'test2.svg', { type: 'image/svg+xml' }),
    ]

    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    // Mock FileReader
    vi.spyOn(window, 'FileReader').mockImplementation(() => ({
      readAsText: vi.fn(),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
      result: svgContent,
    } as unknown as FileReader))

    fireEvent.change(input, { target: { files } })

    // Check for processing state
    await waitFor(() => {
      const uploader = container.querySelector('.file-uploader')
      expect(uploader).toHaveClass('processing')
    }, { timeout: 100 })
  })

  it('filters non-SVG files', async () => {
    const mockOnFilesLoad = vi.fn()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<FileUploader onFilesLoad={mockOnFilesLoad} multiple={true} />)

    const nonSvgFile = new File(['content'], 'test.txt', { type: 'text/plain' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, { target: { files: [nonSvgFile] } })

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please select at least one SVG file')
    })

    alertSpy.mockRestore()
  })

  it('respects maxFiles limit', async () => {
    const mockOnFilesLoad = vi.fn()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<FileUploader onFilesLoad={mockOnFilesLoad} multiple={true} maxFiles={2} />)

    const svgContent = '<svg><circle cx="50" cy="50" r="40" /></svg>'
    const files = [
      new File([svgContent], 'test1.svg', { type: 'image/svg+xml' }),
      new File([svgContent], 'test2.svg', { type: 'image/svg+xml' }),
      new File([svgContent], 'test3.svg', { type: 'image/svg+xml' }),
    ]

    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, { target: { files } })

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Maximum 2 files allowed'))
    })

    alertSpy.mockRestore()
  })
})

