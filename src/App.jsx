import { useState, useRef, useCallback } from 'react'
import RichTextEditor from './components/RichTextEditor'
import DocumentSettings from './components/DocumentSettings'
import PagePreview from './components/PagePreview'
import PDFEditor from './components/PDFEditor'
import ContentModal from './components/ContentModal'
import { DEFAULT_COVER_FIELDS, generateCoverPage } from './components/CoverPageModal'
import { generatePDFFromContent } from './utils/pdfGenerator'

const DEFAULT_SETTINGS = {
  pageSize: 'A4',
  orientation: 'portrait',
  marginPreset: 'normal',
  margins: { top: 25, right: 25, bottom: 25, left: 25 },
  coverMarginPreset: 'none',
  bgColor: '#ffffff',
  defaultFont: 'Inter',
  defaultFontSize: '16px',
  logoData: null,
  logoWidth: 120,
  logoOpacity: 35,
}

function normalizePages(data) {
  if (Array.isArray(data)) return data.length ? data : ['']
  if (typeof data === 'string' && data.trim()) {
    return data.split(/<hr\s*\/?>/gi).map((s) => s.trim() ? s : '')
  }
  return ['']
}

function normalizeCoverPage(cp) {
  if (typeof cp === 'string') {
    return { templateId: 'gradient-hero', fields: { ...DEFAULT_COVER_FIELDS }, html: cp }
  }
  if (cp && cp.html) {
    return {
      ...cp,
      fields: { ...DEFAULT_COVER_FIELDS, ...(cp.fields || {}) },
    }
  }
  return null
}

function App() {
  const [pages, setPages] = useState([''])
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [view, setView] = useState('editor')
  const [pdfBytes, setPdfBytes] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)
  const [previewScale, setPreviewScale] = useState(0.55)
  const [showPreview, setShowPreview] = useState(true)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showContentModal, setShowContentModal] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const [coverPage, setCoverPage] = useState(null)
  const editorRef = useRef(null)
  const previewRef = useRef(null)
  const activePageRef = useRef(0)
  activePageRef.current = activePageIndex

  const handleContentSubmit = (formattedContent) => {
    const newPages = normalizePages(formattedContent)
    setPages(newPages)
    setActivePageIndex(0)
    setEditorKey(k => k + 1)
    setShowContentModal(false)
  }

  const handlePageChange = useCallback((html) => {
    setPages(prev => {
      const next = [...prev]
      next[activePageRef.current] = html
      return next
    })
  }, [])

  const handleAddPage = () => {
    setPages(prev => [...prev, ''])
    setActivePageIndex(pages.length)
    setEditorKey(k => k + 1)
  }

  const handleRemovePage = () => {
    if (pages.length <= 1) return
    setPages(prev => {
      const next = prev.filter((_, i) => i !== activePageIndex)
      return next.length ? next : ['']
    })
    setActivePageIndex(idx => Math.max(0, idx - 1))
    setEditorKey(k => k + 1)
  }

  const handleSelectPage = (idx) => {
    setActivePageIndex(idx)
    setEditorKey(k => k + 1)
  }

  const allPagesForOutput = () => {
    const result = [...pages]
    if (coverPage?.html) result.unshift(coverPage.html)
    return result
  }

  const handleGeneratePDF = useCallback(async () => {
    setGenerating(true)
    setError(null)
    try {
      const allPages = allPagesForOutput()
      const pdf = await generatePDFFromContent(allPages, settings, coverPage)
      const bytes = pdf.output('arraybuffer')
      const uint8 = new Uint8Array(bytes)
      setPdfBytes(uint8)
      setView('pdfEditor')
    } catch (err) {
      setError('Failed to generate PDF: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }, [pages, settings, docTitle, coverPage])

  const handleDownloadPDF = useCallback(async () => {
    setDownloading(true)
    setError(null)
    try {
      const allPages = allPagesForOutput()
      const pdf = await generatePDFFromContent(allPages, settings, coverPage)
      pdf.save((docTitle || 'document') + '.pdf')
    } catch (err) {
      setError('Failed to generate PDF: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }, [pages, settings, docTitle, coverPage])

  const handleNewDocument = () => {
    setPages([''])
    setActivePageIndex(0)
    setSettings(DEFAULT_SETTINGS)
    setDocTitle('')
    setCoverPage(null)
    setView('editor')
    setPdfBytes(null)
    setError(null)
    setShowContentModal(true)
    setEditorKey(k => k + 1)
  }

  const handleSaveDocument = () => {
    const doc = { pages, settings, title: docTitle, coverPage }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (docTitle || 'document') + '.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoadDocument = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const doc = JSON.parse(reader.result)
        setView('editor')
        setShowContentModal(false)
        setPdfBytes(null)
        setError(null)
        setSettings({ ...DEFAULT_SETTINGS, ...(doc.settings || {}) })
        setDocTitle(doc.title || '')
        setCoverPage(normalizeCoverPage(doc.coverPage))
        const loadedPages = normalizePages(doc.pages || doc.content || '')
        setPages(loadedPages)
        setActivePageIndex(0)
        setEditorKey(k => k + 1)
      } catch {
        setError('Invalid document file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDownloadFromEditor = (bytes) => {
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (docTitle || 'document') + '.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  // PDF Editor view
  if (view === 'pdfEditor' && pdfBytes) {
    return (
      <div className="h-screen flex flex-col bg-neutral-100">
        <PDFEditor
          pdfBytes={pdfBytes}
          onDownload={handleDownloadFromEditor}
          onBack={() => setView('editor')}
        />
      </div>
    )
  }

  const hasCover = !!coverPage?.html
  const previewPages = hasCover ? [coverPage.html, ...pages] : pages

  return (
    <div className="h-screen flex flex-col bg-neutral-100">
      {showContentModal && (
        <ContentModal
          onSubmit={handleContentSubmit}
          onCancel={() => setShowContentModal(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white">
            <i className="bi bi-file-earmark-pdf-fill text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-800 leading-tight">Text-to-PDF Generator</h1>
            <p className="text-xs text-neutral-500">Create, edit, and export PDF documents</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleNewDocument} className="btn btn-sm btn-secondary">
            <i className="bi bi-file-earmark-plus"></i> New
          </button>
          <label className="btn btn-sm btn-secondary cursor-pointer">
            <i className="bi bi-folder2-open"></i> Open
            <input type="file" accept=".json" onChange={handleLoadDocument} className="hidden" />
          </label>
          <button onClick={handleSaveDocument} className="btn btn-sm btn-secondary">
            <i className="bi bi-save"></i> Save
          </button>
          <button onClick={() => setShowContentModal(true)} className="btn btn-sm btn-secondary">
            <i className="bi bi-plus-circle"></i> Add Content
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="btn btn-sm btn-secondary hidden xl:inline-flex">
            <i className={`bi ${showPreview ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button onClick={() => setShowPreviewModal(true)} className="btn btn-sm btn-secondary xl:hidden">
            <i className="bi bi-eye"></i> Preview
          </button>
          <button onClick={handleDownloadPDF} disabled={downloading} className="btn btn-sm btn-dark">
            {downloading ? (
              <i className="bi bi-arrow-clockwise animate-spin"></i>
            ) : (
              <i className="bi bi-download"></i>
            )}
            Download
          </button>
          <button onClick={handleGeneratePDF} disabled={generating} className="btn btn-sm btn-primary">
            {generating ? (
              <><i className="bi bi-arrow-clockwise animate-spin"></i> Generating...</>
            ) : (
              <><i className="bi bi-lightning-charge-fill"></i> Generate PDF</>
            )}
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-700 text-sm flex items-center justify-between">
          <span><i className="bi bi-exclamation-triangle-fill mr-1"></i>{error}</span>
          <button onClick={() => setError(null)} className="btn-icon"><i className="bi bi-x-lg"></i></button>
        </div>
      )}

      {/* Doc title bar */}
      <div className="bg-white border-b border-neutral-100 px-4 py-2 flex items-center gap-2">
        <i className="bi bi-pencil text-neutral-400 text-sm"></i>
        <input
          type="text"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          placeholder="Document title (used for filename)..."
          className="input-field"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Settings */}
        <aside className="w-64 bg-neutral-50 border-r border-neutral-200 overflow-y-auto p-3 hidden lg:block">
          <DocumentSettings
            settings={settings}
            onChange={setSettings}
            coverPage={coverPage}
            onCoverPageChange={setCoverPage}
          />
        </aside>

        {/* Center - Editor */}
        <main className="flex-1 flex flex-col overflow-hidden p-3 min-w-0">
          <RichTextEditor
            key={editorKey}
            content={pages[activePageIndex] || ''}
            onChange={handlePageChange}
            editorRef={editorRef}
            remountKey={editorKey}
            pages={pages}
            activePageIndex={activePageIndex}
            onAddPage={handleAddPage}
            onRemovePage={handleRemovePage}
            onSelectPage={handleSelectPage}
          />
          {coverPage && (
            <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-amber-700"><i className="bi bi-bookmark-star-fill mr-1"></i>Cover page active: {coverPage.fields?.title || 'Untitled'}</span>
              <button onClick={() => setCoverPage(null)} className="btn btn-xs btn-danger">
                <i className="bi bi-x-lg"></i> Remove
              </button>
            </div>
          )}
        </main>

        {/* Right - Preview */}
        {showPreview && (
          <aside className="w-[480px] bg-neutral-200 border-l border-neutral-200 preview-panel p-4 hidden xl:block">
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-neutral-200 py-1 z-10">
              <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <i className="bi bi-eye-fill"></i> Live Preview
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={() => setPreviewScale(Math.max(0.3, previewScale - 0.1))} className="btn-icon">
                  <i className="bi bi-dash-lg"></i>
                </button>
                <span className="text-xs text-neutral-600 w-10 text-center">{Math.round(previewScale * 100)}%</span>
                <button onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))} className="btn-icon">
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>
            <div ref={previewRef} className="flex justify-center">
              <PagePreview pages={previewPages} settings={settings} scale={previewScale} hasCover={hasCover} />
            </div>
          </aside>
        )}
      </div>

      {/* Mobile settings toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <details className="bg-white rounded-xl shadow-xl border border-neutral-200">
          <summary className="px-4 py-2 cursor-pointer font-medium text-sm text-neutral-700 flex items-center gap-1.5">
            <i className="bi bi-gear-fill"></i> Settings
          </summary>
          <div className="p-3 w-72 max-h-[60vh] overflow-y-auto">
            <DocumentSettings
              settings={settings}
              onChange={setSettings}
              coverPage={coverPage}
              onCoverPageChange={setCoverPage}
            />
          </div>
        </details>
      </div>

      {/* Mobile preview modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 xl:hidden" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-neutral-200 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <i className="bi bi-eye-fill"></i> Document Preview
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button onClick={() => setPreviewScale(Math.max(0.3, previewScale - 0.1))} className="btn-icon">
                    <i className="bi bi-dash-lg"></i>
                  </button>
                  <span className="text-xs text-neutral-600 w-10 text-center">{Math.round(previewScale * 100)}%</span>
                  <button onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))} className="btn-icon">
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="btn btn-sm btn-secondary">
                  <i className="bi bi-x-lg"></i> Close
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <PagePreview pages={previewPages} settings={settings} scale={previewScale} hasCover={hasCover} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
