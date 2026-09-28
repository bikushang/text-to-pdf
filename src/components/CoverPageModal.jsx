import { useState } from 'react'

export const COVER_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Centered title with subtitle and author',
    generate: ({ title, subtitle, author, date }) => `
<div style="min-height:820px; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:100px 40px;">
<h2 style="font-size:1.5em; font-weight:700; color:#6b7280; font-family:Georgia, serif; margin-bottom:16px;text-transform:uppercase;">Duolingo</h2>  
<h1 style="font-size:2.8em; font-weight:700; color:#1e293b; margin-bottom:16px;">${title || 'Document Title'}</h1>
  <p style="font-size:1.2em; color:#64748b; margin-bottom:40px;">${subtitle || 'Subtitle goes here'}</p>
  <div style="width:60px; height:3px; background:#3b82f6; margin:0 auto 40px;"></div>
  <p style="font-size:1em; color:#475569;">${author || 'Author Name'}</p>
  <p style="font-size:0.9em; color:#94a3b8;">${date || ''}</p>
</div>`,
  },
  {
    id: 'banner',
    name: 'Banner',
    description: 'Full-width colored banner with title',
    generate: ({ title, subtitle, author, date }) => `
<div style="min-height:820px; box-sizing:border-box; margin:-25px; background:linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding:100px 40px; color:white; display:flex; flex-direction:column; justify-content:center;">
<h2 style="font-size:1.5em; font-weight:700; color:#6b7280; font-family:Georgia, serif; margin-bottom:16px;text-transform:uppercase;">Duolingo</h2>  
<h1 style="font-size:2.5em; font-weight:700; margin-bottom:12px; color:white;">${title || 'Document Title'}</h1>
  <p style="font-size:1.2em; opacity:0.9; margin-bottom:8px;">${subtitle || 'Subtitle goes here'}</p>
  <p style="font-size:0.95em; opacity:0.7;">${author || 'Author Name'}${date ? ' | ' + date : ''}</p>
</div>`,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean left-aligned title with thin accent line',
    generate: ({ title, subtitle, author, date }) => `
<div style="min-height:820px; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center; padding:100px 40px; border-left:10px solid #0ea5e9;">
  <div style="width:80px; height:4px; background:#0ea5e9; margin-bottom:24px;"></div>
  <h2 style="font-size:1.5em; font-weight:700; color:#6b7280; font-family:Georgia, serif; margin-bottom:16px;text-transform:uppercase;">Duolingo</h2>
  <h1 style="font-size:2.4em; font-weight:700; color:#0f172a; margin-bottom:12px;">${title || 'Document Title'}</h1>
  <p style="font-size:1.1em; color:#64748b; margin-bottom:32px;">${subtitle || 'Subtitle goes here'}</p>
  <p style="font-size:0.95em; color:#94a3b8;">${author || 'Author Name'}${date ? '  |  ' + date : ''}</p>
</div>`,
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Centered serif title with an open layout',
    generate: ({ title, subtitle, author, date }) => `
<div style="min-height:820px; box-sizing:border-box; padding:100px 40px; text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center;">
<h2 style="font-size:1.5em; font-weight:700; color:#6b7280; font-family:Georgia, serif; margin-bottom:16px;text-transform:uppercase;">Duolingo</h2>
  <h1 style="font-size:2.6em; font-weight:700; color:#1e293b; font-family:Georgia, serif; margin-bottom:16px;">${title || 'Document Title'}</h1>
  <div style="width:40px; height:1px; background:#cbd5e1; margin:24px auto;"></div>
  <p style="font-size:1.1em; color:#64748b; font-style:italic; margin-bottom:32px;">${subtitle || 'Subtitle goes here'}</p>
  <p style="font-size:0.95em; color:#475569;">${author || 'Author Name'}</p>
  <p style="font-size:0.85em; color:#94a3b8;">${date || ''}</p>
</div>`,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold left bar with large title and color block',
    generate: ({ title, subtitle, author, date }) => `
<div style="display:flex; min-height:820px; box-sizing:border-box; align-items:stretch;">
  <div style="width:12px; background:#f59e0b; flex-shrink:0;"></div>
  <div style="padding:100px 40px; flex:1; display:flex; flex-direction:column; justify-content:center;">
    <h2 style="font-size:1.5em; font-weight:700; color:#6b7280; font-family:Georgia, serif; margin-bottom:16px;text-transform:uppercase;">Duolingo</h2> 
    <h1 style="font-size:2.6em; font-weight:800; color:#0f172a; margin-bottom:16px; line-height:1.1;">${title || 'Document Title'}</h1>
    <p style="font-size:1.15em; color:#64748b; margin-bottom:40px;">${subtitle || 'Subtitle goes here'}</p>
    <div style="display:flex; gap:24px; align-items:center;">
      <p style="font-size:0.95em; color:#475569; font-weight:600;">${author || 'Author Name'}</p>
      <p style="font-size:0.9em; color:#94a3b8;">${date || ''}</p>
    </div>
  </div>
</div>`,
  },
  {
    id: 'darkbox',
    name: 'Dark Box',
    description: 'Dark centered card with light text',
    generate: ({ title, subtitle, author, date }) => `
<div style="min-height:820px; box-sizing:border-box; background:#1e293b; padding:100px 40px; text-align:center; border-radius:8px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
<h2 style="font-size:1.5em; font-weight:700; color:#6b7280; font-family:Georgia, serif; margin-bottom:16px;text-transform:uppercase;">Duolingo</h2>  
<h1 style="font-size:2.4em; font-weight:700; color:white; margin-bottom:16px;">${title || 'Document Title'}</h1>
  <div style="width:50px; height:2px; background:#38bdf8; margin:20px auto;"></div>
  <p style="font-size:1.15em; color:#cbd5e1; margin-bottom:32px;">${subtitle || 'Subtitle goes here'}</p>
  <p style="font-size:0.95em; color:#94a3b8;">${author || 'Author Name'}${date ? '  |  ' + date : ''}</p>
</div>`,
  },
]

export function generateCoverHtml(coverPage, logoData = null, logoWidth = 120) {
  const template = COVER_TEMPLATES.find((item) => item.id === coverPage?.templateId) || COVER_TEMPLATES[0]
  const fields = coverPage?.fields || {}
  const logoHtml = logoData
    ? `<div style="width:100%; display:flex; justify-content:center; align-items:center; text-align:center; margin:0 0 28px;">
         <img src="${logoData}" alt="Logo" style="width:${logoWidth}px; max-width:100%; height:auto; object-fit:contain;" />
       </div>`
    : ''

  return logoHtml + template.generate(fields)
}

export default function CoverPageModal({ onInsert, onCancel }) {
  const [selectedTemplate, setSelectedTemplate] = useState(COVER_TEMPLATES[0])
  const [fields, setFields] = useState({
    title: '',
    subtitle: '',
    author: '',
    date: new Date().toLocaleDateString(),
  })

  const handleInsert = () => {
    const html = selectedTemplate.generate(fields)
    onInsert(html)
  }

  const updateField = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 bg-neutral-900/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">Add Cover Page</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Pick a template, fill in the details, and it will be inserted as the first page.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          {/* Template picker */}
          <div className="lg:w-64 p-4 border-b lg:border-b-0 lg:border-r border-neutral-200 bg-neutral-50">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Templates</h3>
            <div className="space-y-2">
              {COVER_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate.id === tpl.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="font-medium text-sm text-neutral-800">{tpl.name}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{tpl.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form + Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Form fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <input
                  type="text"
                  value={fields.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Document title..."
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={fields.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="Subtitle or tagline..."
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Author</label>
                <input
                  type="text"
                  value={fields.author}
                  onChange={(e) => updateField('author', e.target.value)}
                  placeholder="Author name..."
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
                <input
                  type="text"
                  value={fields.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  placeholder="Date..."
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Live preview */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Preview</h3>
              <div className="bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
                <div
                  className="preview-content"
                  style={{ minHeight: '300px', padding: '20px' }}
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.generate(fields) }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            The cover page will be added before your existing content.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
            >
              Insert Cover Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
