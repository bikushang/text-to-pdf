import { useState, useRef, useCallback, useEffect } from 'react'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export default function PDFEditor({ pdfBytes, onDownload, onBack }) {
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [pageInfos, setPageInfos] = useState([])
  const [selectedPage, setSelectedPage] = useState(0)
  const [zoom, setZoom] = useState(1.0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTool, setActiveTool] = useState('select')
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' })
  const [signatureMode, setSignatureMode] = useState(false)
  const [rendering, setRendering] = useState(false)
  const canvasRef = useRef(null)

  // Load PDF with pdf-lib
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const doc = await PDFDocument.load(pdfBytes)
        if (cancelled) return
        setPdfDoc(doc)
        const pages = doc.getPages()
        setPageCount(pages.length)
        setPageInfos(pages.map((p, i) => ({
          index: i,
          width: p.getWidth(),
          height: p.getHeight(),
          rotation: p.getRotation().angle,
        })))
        setLoading(false)
      } catch (err) {
        setError('Failed to load PDF: ' + err.message)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [pdfBytes])

  // Render selected page using pdf.js
  const renderPage = useCallback(async () => {
    if (!pdfDoc) return
    setRendering(true)
    try {
      const pdfBytesCurrent = await pdfDoc.save()
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytesCurrent.slice(0) })
      const jsDoc = await loadingTask.promise
      const page = await jsDoc.getPage(selectedPage + 1)

      const viewport = page.getViewport({ scale: 1.5 * zoom })
      const canvas = canvasRef.current
      if (!canvas) {
        await jsDoc.destroy()
        setRendering(false)
        return
      }
      const ctx = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.width = viewport.width + 'px'
      canvas.style.height = viewport.height + 'px'

      await page.render({ canvas, viewport }).promise
      await jsDoc.destroy()
    } catch (err) {
      console.error('Render error:', err)
    }
    setRendering(false)
  }, [pdfDoc, selectedPage, zoom])

  useEffect(() => {
    renderPage()
  }, [renderPage])

  // Generate thumbnail for a page
  const renderThumbnail = useCallback(async (doc, pageIndex) => {
    try {
      const bytes = await doc.save()
      const jsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise
      const page = await jsDoc.getPage(pageIndex + 1)
      const viewport = page.getViewport({ scale: 0.2 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvas, viewport }).promise
      const dataUrl = canvas.toDataURL('image/png')
      await jsDoc.destroy()
      return dataUrl
    } catch (err) {
      console.error('Thumbnail error:', err)
      return null
    }
  }, [])

  const [thumbnails, setThumbnails] = useState([])

  // Generate all thumbnails when pageInfos change
  useEffect(() => {
    if (!pdfDoc) return
    let cancelled = false
    async function genAll() {
      const thumbs = []
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        if (cancelled) return
        const url = await renderThumbnail(pdfDoc, i)
        thumbs.push(url)
      }
      if (!cancelled) setThumbnails(thumbs)
    }
    genAll()
    return () => { cancelled = true }
  }, [pdfDoc, renderThumbnail])

  // Page operations
  const rotatePage = async (pageIndex) => {
    if (!pdfDoc) return
    const page = pdfDoc.getPage(pageIndex)
    const currentRotation = page.getRotation().angle
    page.setRotation(degrees((currentRotation + 90) % 360))
    setPageInfos(pdfDoc.getPages().map((p, i) => ({
      index: i,
      width: p.getWidth(),
      height: p.getHeight(),
      rotation: p.getRotation().angle,
    })))
    setPdfDoc({ ...pdfDoc })
  }

  const deletePage = async (pageIndex) => {
    if (!pdfDoc || pdfDoc.getPageCount() <= 1) return
    pdfDoc.removePage(pageIndex)
    const newCount = pdfDoc.getPageCount()
    if (selectedPage >= newCount) {
      setSelectedPage(Math.max(0, newCount - 1))
    }
    setPageCount(newCount)
    setPageInfos(pdfDoc.getPages().map((p, i) => ({
      index: i,
      width: p.getWidth(),
      height: p.getHeight(),
      rotation: p.getRotation().angle,
    })))
    setThumbnails([])
    setPdfDoc({ ...pdfDoc })
  }

  const movePage = async (fromIndex, toIndex) => {
    if (!pdfDoc || fromIndex === toIndex || toIndex < 0 || toIndex >= pdfDoc.getPageCount()) return
    // Create a new document with reordered pages
    const newDoc = await PDFDocument.create()
    const indices = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i)
    const [moved] = indices.splice(fromIndex, 1)
    indices.splice(toIndex, 0, moved)
    const copiedPages = await newDoc.copyPages(pdfDoc, indices)
    copiedPages.forEach((p) => newDoc.addPage(p))
    if (selectedPage === fromIndex) {
      setSelectedPage(toIndex)
    } else if (fromIndex < selectedPage && toIndex >= selectedPage) {
      setSelectedPage(selectedPage - 1)
    } else if (fromIndex > selectedPage && toIndex <= selectedPage) {
      setSelectedPage(selectedPage + 1)
    }
    setPageInfos(newDoc.getPages().map((p, i) => ({
      index: i,
      width: p.getWidth(),
      height: p.getHeight(),
      rotation: p.getRotation().angle,
    })))
    setThumbnails([])
    setPdfDoc(newDoc)
  }

  const movePageUp = (idx) => movePage(idx, idx - 1)
  const movePageDown = (idx) => movePage(idx, idx + 1)

  // Add text annotation
  const addTextAnnotation = async (pageIndex, x, y, text, fontSize = 14, color = '#000000') => {
    if (!pdfDoc || !text.trim()) return
    const page = pdfDoc.getPage(pageIndex)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      return rgb(r, g, b)
    }

    const pageHeight = page.getHeight()
    page.drawText(text, {
      x,
      y: pageHeight - y - fontSize,
      size: fontSize,
      font,
      color: hexToRgb(color),
    })

    setThumbnails([])
    setPdfDoc({ ...pdfDoc })
  }

  // Add image annotation
  const addImageAnnotation = async (pageIndex, x, y, imageBytes, width, height) => {
    if (!pdfDoc) return
    const page = pdfDoc.getPage(pageIndex)
    let img
    try {
      img = await pdfDoc.embedPng(imageBytes)
    } catch {
      img = await pdfDoc.embedJpg(imageBytes)
    }

    const pageHeight = page.getHeight()
    page.drawImage(img, {
      x,
      y: pageHeight - y - height,
      width,
      height,
    })

    setThumbnails([])
    setPdfDoc({ ...pdfDoc })
  }

  // Handle canvas click for text placement
  const handleCanvasClick = (e) => {
    if (activeTool !== 'text' || !pdfDoc) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const page = pdfDoc.getPage(selectedPage)
    const scaleX = page.getWidth() / rect.width
    const scaleY = page.getHeight() / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    setTextInput({ visible: true, x, y, value: '' })
  }

  const submitText = () => {
    if (textInput.value.trim()) {
      addTextAnnotation(selectedPage, textInput.x, textInput.y, textInput.value)
    }
    setTextInput({ visible: false, x: 0, y: 0, value: '' })
    setActiveTool('select')
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !pdfDoc) return
    const reader = new FileReader()
    reader.onload = async () => {
      const bytes = new Uint8Array(reader.result)
      addImageAnnotation(selectedPage, 50, 50, bytes, 150, 100)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const handleDownload = async () => {
    if (!pdfDoc) return
    const bytes = await pdfDoc.save()
    onDownload(bytes)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-neutral-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
        Loading PDF editor...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-500">
        <p>{error}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg">Back to Editor</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-neutral-800 text-white">
        <button onClick={onBack} className="px-3 py-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-sm">
          &larr; Back to Editor
        </button>
        <div className="w-px h-6 bg-neutral-600" />

        <button
          onClick={() => setActiveTool(activeTool === 'text' ? 'select' : 'text')}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${activeTool === 'text' ? 'bg-primary-600' : 'bg-neutral-700 hover:bg-neutral-600'}`}
        >
          {activeTool === 'text' ? 'Click on page to place text' : 'Add Text'}
        </button>
        <label className="px-3 py-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-sm cursor-pointer">
          Add Image
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        <button
          onClick={() => setSignatureMode(!signatureMode)}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${signatureMode ? 'bg-primary-600' : 'bg-neutral-700 hover:bg-neutral-600'}`}
        >
          Signature
        </button>

        <div className="w-px h-6 bg-neutral-600" />

        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="px-3 py-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-sm">
          Zoom -
        </button>
        <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="px-3 py-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-sm">
          Zoom +
        </button>

        <div className="w-px h-6 bg-neutral-600" />

        <button onClick={() => rotatePage(selectedPage)} className="px-3 py-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-sm">
          Rotate Page
        </button>
        <button
          onClick={() => deletePage(selectedPage)}
          disabled={pageCount <= 1}
          className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete Page
        </button>

        <div className="flex-1" />

        <button onClick={handleDownload} className="px-4 py-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-sm font-semibold">
          Download PDF
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Page thumbnails */}
        <div className="w-44 bg-neutral-100 border-r border-neutral-200 overflow-y-auto p-2 space-y-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <div
              key={i}
              onClick={() => setSelectedPage(i)}
              className={`p-2 rounded-md cursor-pointer border-2 transition-all ${
                selectedPage === i ? 'border-primary-600 bg-primary-50' : 'border-transparent hover:border-neutral-300 bg-white'
              }`}
            >
              <div className="bg-white border border-neutral-200 flex items-center justify-center overflow-hidden" style={{ aspectRatio: pageInfos[i]?.width / pageInfos[i]?.height || 0.707 }}>
                {thumbnails[i] ? (
                  <img src={thumbnails[i]} alt={`Page ${i + 1}`} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-neutral-400 text-xs">Page {i + 1}</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-neutral-500 font-medium">P{i + 1}</span>
                <div className="flex gap-0.5">
                  <button onClick={(e) => { e.stopPropagation(); movePageUp(i) }} disabled={i === 0} className="text-xs px-1.5 py-0.5 rounded hover:bg-neutral-200 disabled:opacity-30">&#9650;</button>
                  <button onClick={(e) => { e.stopPropagation(); movePageDown(i) }} disabled={i === pageCount - 1} className="text-xs px-1.5 py-0.5 rounded hover:bg-neutral-200 disabled:opacity-30">&#9660;</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main canvas area */}
        <div className="flex-1 overflow-auto bg-neutral-300 flex justify-center items-start p-6 relative">
          <div className="relative shadow-2xl">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="bg-white"
              style={{ cursor: activeTool === 'text' ? 'crosshair' : 'default' }}
            />
            {rendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>

          {textInput.visible && (
            <div className="absolute z-50 bg-white rounded-lg shadow-xl border border-neutral-300 p-4" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <h4 className="font-semibold mb-2 text-neutral-800">Add Text</h4>
              <textarea
                value={textInput.value}
                onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                placeholder="Enter text..."
                className="w-64 h-20 px-3 py-2 border border-neutral-300 rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setTextInput({ visible: false, x: 0, y: 0, value: '' })} className="px-3 py-1.5 rounded-md bg-neutral-200 text-sm hover:bg-neutral-300">Cancel</button>
                <button onClick={submitText} className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700">Add</button>
              </div>
            </div>
          )}

          {signatureMode && (
            <SignaturePad
              onSave={async (sigBytes) => {
                await addImageAnnotation(selectedPage, 50, 50, sigBytes, 200, 100)
                setSignatureMode(false)
              }}
              onCancel={() => setSignatureMode(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function SignaturePad({ onSave, onCancel }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e) => {
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e) => {
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDraw = () => {
    drawing.current = false
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const save = async () => {
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    const response = await fetch(dataUrl)
    const arrayBuffer = await response.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    onSave(bytes)
  }

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6">
        <h4 className="font-semibold mb-3 text-neutral-800">Draw Your Signature</h4>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="border-2 border-neutral-300 rounded-lg cursor-crosshair bg-white"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
        />
        <div className="flex gap-2 justify-end mt-3">
          <button onClick={clear} className="px-3 py-1.5 rounded-md bg-neutral-200 text-sm hover:bg-neutral-300">Clear</button>
          <button onClick={onCancel} className="px-3 py-1.5 rounded-md bg-neutral-200 text-sm hover:bg-neutral-300">Cancel</button>
          <button onClick={save} className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700">Save Signature</button>
        </div>
      </div>
    </div>
  )
}
