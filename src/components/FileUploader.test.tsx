import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FileUploader from './FileUploader'

describe('FileUploader', () => {
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

