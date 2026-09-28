import { useState, useRef, useCallback } from 'react'
import RichTextEditor from './components/RichTextEditor'
import DocumentSettings from './components/DocumentSettings'
import PagePreview from './components/PagePreview'
import PDFEditor from './components/PDFEditor'
import ContentModal from './components/ContentModal'
import { generatePDFFromContent } from './utils/pdfGenerator'
import { generateCoverHtml } from './components/CoverPageModal'

const DEFAULT_SETTINGS = {
  pageSize: 'A4',
  orientation: 'portrait',
  marginPreset: 'normal',
  margins: { top: 25, right: 25, bottom: 25, left: 25 },
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
  if (typeof cp === 'string') return { templateId: 'classic', fields: {}, html: cp }
  if (cp && cp.html) return cp
  return null
}

function getCoverLogoData(coverPage, settings) {
  return Object.prototype.hasOwnProperty.call(coverPage || {}, 'logoData')
    ? coverPage.logoData
    : settings.logoData
}

function getCoverLogoWidth(coverPage, settings) {
  return coverPage?.logoWidth || settings.logoWidth
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
  const [previewScale, setPreviewScale] = useState(0.85)
  const [showPreview, setShowPreview] = useState(true)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showContentModal, setShowContentModal] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const [coverPage, setCoverPage] = useState(null)
  const editorRef = useRef(null)
  const previewRef = useRef(null)

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
      next[activePageIndex] = html
      return next
    })
  }, [activePageIndex])

  const handleAddPage = () => {
    setPages(prev => [...prev, ''])
    setActivePageIndex(pages.length)
  }

  const handleRemovePage = () => {
    if (pages.length <= 1) return
    setPages(prev => {
      const next = prev.filter((_, i) => i !== activePageIndex)
      return next.length ? next : ['']
    })
    setActivePageIndex(idx => Math.max(0, idx - 1))
  }

  const handleSelectPage = (idx) => {
    setActivePageIndex(idx)
    setEditorKey(k => k + 1)
  }

  const allPagesForOutput = () => {
    const result = [...pages]
    const coverHtml = coverPage
      ? generateCoverHtml(coverPage, getCoverLogoData(coverPage, settings), getCoverLogoWidth(coverPage, settings))
      : null
    if (coverHtml) result.unshift(coverHtml)
    return result
  }

  const handleGeneratePDF = useCallback(async () => {
    setGenerating(true)
    setError(null)
    try {
      const allPages = allPagesForOutput()
      const pdf = await generatePDFFromContent(allPages, settings, { coverPageCount: coverPage ? 1 : 0 })
      const bytes = pdf.output('arraybuffer')
      const uint8 = new Uint8Array(bytes)
      setPdfBytes(uint8)

      const pdfDataUrl = pdf.output('datauristring')
      savePdfRecord({
        title: docTitle || 'Untitled Document',
        pages,
        settings,
        coverPage,
        pdfData: pdfDataUrl,
        logoData: settings.logoData,
      })

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
      const pdf = await generatePDFFromContent(allPages, settings, { coverPageCount: coverPage ? 1 : 0 })
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
        setSettings(doc.settings || DEFAULT_SETTINGS)
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

  const handleEditSavedPdf = (record) => {
    setView('editor')
    setShowContentModal(false)
    setPdfBytes(null)
    setError(null)
    setSettings(record.settings || DEFAULT_SETTINGS)
    setDocTitle(record.title || '')
    setCoverPage(normalizeCoverPage(record.coverPage))
    const loadedPages = normalizePages(record.pages || record.content || '')
    setPages(loadedPages)
    setActivePageIndex(0)
    setEditorKey(k => k + 1)
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

  const coverHtml = coverPage
    ? generateCoverHtml(coverPage, getCoverLogoData(coverPage, settings), getCoverLogoWidth(coverPage, settings))
    : null
  const previewPages = coverHtml ? [coverHtml, ...pages] : pages

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
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-800 leading-tight">Text-to-PDF Generator</h1>
            <p className="text-xs text-neutral-500">Create, edit, and export PDF documents</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleNewDocument}
            className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-colors"
          >
            New
          </button>
          <label className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-colors cursor-pointer">
            Open
            <input type="file" accept=".json" onChange={handleLoadDocument} className="hidden" />
          </label>
          <button
            onClick={handleSaveDocument}
            className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setShowContentModal(true)}
            className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-colors"
          >
            Add Content
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-colors hidden xl:inline-flex"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-colors xl:hidden"
          >
            Preview
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-3 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-800 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {downloading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : null}
            Download
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Generating...
              </>
            ) : (
              'Generate PDF'
            )}
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Doc title bar */}
      <div className="bg-white border-b border-neutral-100 px-4 py-2 flex items-center gap-2">
        <input
          type="text"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          placeholder="Document title (used for filename)..."
          className="flex-1 px-3 py-1.5 rounded-md border border-neutral-200 text-sm focus:outline-none:ring-1 focus:ring-primary-500"
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
        <main className="flex-1 flex flex-col overflow-hidden p-3">
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
              <span className="text-sm text-amber-700">Cover page: {coverPage.fields?.title || 'Untitled'} (edit in settings)</span>
              <button onClick={() => setCoverPage(null)} className="text-xs text-amber-600 hover:text-amber-800 font-medium">Remove</button>
            </div>
          )}
        </main>

        {/* Right - Preview (bigger, page-by-page) */}
        {showPreview && (
          <aside className="w-[560px] bg-neutral-200 border-l border-neutral-200 overflow-y-auto p-4 hidden xl:block">
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-neutral-200 py-1 z-10">
              <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Live Preview</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewScale(Math.max(0.3, previewScale - 0.1))}
                  className="w-7 h-7 rounded bg-white hover:bg-neutral-100 text-neutral-600 text-sm flex items-center justify-center border border-neutral-300"
                >
                  -
                </button>
                <span className="text-xs text-neutral-600 w-10 text-center">{Math.round(previewScale * 100)}%</span>
                <button
                  onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))}
                  className="w-7 h-7 rounded bg-white hover:bg-neutral-100 text-neutral-600 text-sm flex items-center justify-center border border-neutral-300"
                >
                  +
                </button>
              </div>
            </div>
            <div ref={previewRef}>
              <PagePreview pages={previewPages} settings={settings} scale={previewScale} coverPageCount={coverPage ? 1 : 0} />
            </div>
          </aside>
        )}
      </div>

      {/* Mobile settings toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <details className="bg-white rounded-lg shadow-xl border border-neutral-200">
          <summary className="px-4 py-2 cursor-pointer font-medium text-sm text-neutral-700">Settings</summary>
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
              <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Document Preview</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewScale(Math.max(0.3, previewScale - 0.1))}
                    className="w-7 h-7 rounded bg-white hover:bg-neutral-100 text-neutral-600 text-sm flex items-center justify-center border border-neutral-300"
                  >
                    -
                  </button>
                  <span className="text-xs text-neutral-600 w-10 text-center">{Math.round(previewScale * 100)}%</span>
                  <button
                    onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))}
                    className="w-7 h-7 rounded bg-white hover:bg-neutral-100 text-neutral-600 text-sm flex items-center justify-center border border-neutral-300"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3 py-1.5 rounded-md bg-neutral-300 hover:bg-neutral-400 text-neutral-700 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <PagePreview pages={previewPages} settings={settings} scale={previewScale} coverPageCount={coverPage ? 1 : 0} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
