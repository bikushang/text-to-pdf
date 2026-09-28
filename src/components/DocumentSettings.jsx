import { PAGE_SIZES, ORIENTATIONS, MARGIN_PRESETS, BG_COLORS, FONT_FAMILIES } from '../constants'
import { COVER_TEMPLATES, generateCoverHtml } from './CoverPageModal'

const EMPTY_FIELDS = {
  title: '',
  subtitle: '',
  author: '',
  date: new Date().toLocaleDateString(),
}

export default function DocumentSettings({ settings, onChange, coverPage, onCoverPageChange }) {
  const selectedTemplateId = coverPage?.templateId || COVER_TEMPLATES[0].id
  const selectedTemplate = COVER_TEMPLATES.find((template) => template.id === selectedTemplateId) || COVER_TEMPLATES[0]
  const fields = { ...EMPTY_FIELDS, ...(coverPage?.fields || {}) }
  const hasCoverLogo = Object.prototype.hasOwnProperty.call(coverPage || {}, 'logoData')
  const coverLogoData = hasCoverLogo ? coverPage.logoData : settings.logoData
  const coverLogoWidth = coverPage?.logoWidth || settings.logoWidth

  const updateCover = (
    templateId = selectedTemplate.id,
    nextFields = fields,
    nextLogoData = coverLogoData,
    nextLogoWidth = coverLogoWidth,
  ) => {
    onCoverPageChange({
      templateId,
      fields: nextFields,
      logoData: nextLogoData,
      logoWidth: nextLogoWidth,
      html: generateCoverHtml({ templateId, fields: nextFields }, nextLogoData, nextLogoWidth),
    })
  }
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 space-y-4">
      <h3 className="font-semibold text-neutral-800 text-sm uppercase tracking-wide">Document Settings</h3>

      <div>
        <label className="block text-sm text-neutral-600 mb-1">Page Size</label>
        <select
          value={settings.pageSize}
          onChange={(e) => onChange({ ...settings, pageSize: e.target.value })}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm"
        >
          {Object.entries(PAGE_SIZES).map(([key, val]) => (
            <option key={key} value={key}>{val.label} ({val.width}×{val.height}mm)</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-1">Orientation</label>
        <div className="flex gap-2">
          {Object.entries(ORIENTATIONS).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...settings, orientation: key })}
              className={`flex-1 px-3 py-2 rounded-md text-sm border transition-colors ${
                settings.orientation === key
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-1">Margins</label>
        <select
          value={settings.marginPreset}
          onChange={(e) => {
            const preset = MARGIN_PRESETS[e.target.value]
            onChange({ ...settings, marginPreset: e.target.value, margins: preset })
          }}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm"
        >
          {Object.entries(MARGIN_PRESETS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-1">Page Background</label>
        <div className="flex flex-wrap gap-2">
          {BG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...settings, bgColor: c })}
              className={`w-7 h-7 rounded-md border-2 transition-all ${
                settings.bgColor === c ? 'border-primary-600 scale-110' : 'border-neutral-300'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-1">Default Font</label>
        <select
          value={settings.defaultFont}
          onChange={(e) => onChange({ ...settings, defaultFont: e.target.value })}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm"
        >
          {Object.keys(FONT_FAMILIES).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-1">Default Font Size</label>
        <select
          value={settings.defaultFontSize}
          onChange={(e) => onChange({ ...settings, defaultFontSize: e.target.value })}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm"
        >
          {['12px', '14px', '16px', '18px', '20px'].map((s) => (
            <option key={s} value={s}>{s.replace('px', '')}pt</option>
          ))}
        </select>
      </div>

      {/* Logo / Branding */}
      <div className="border-t border-neutral-200 pt-4 space-y-3">
        <h3 className="font-semibold text-neutral-800 text-sm uppercase tracking-wide">Logo & Branding</h3>

        {settings.logoData ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={settings.logoData}
              alt="Logo preview"
              className="max-h-20 max-w-full object-contain border border-neutral-200 rounded-md p-1 bg-white"
            />
            <button
              type="button"
              onClick={() => onChange({ ...settings, logoData: null })}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove logo
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-1 w-full py-4 px-3 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
            <span className="text-2xl text-neutral-400">&#128247;</span>
            <span className="text-xs text-neutral-500 text-center">Upload one logo for the cover and page branding</span>
            <span className="text-xs text-neutral-400">PNG, JPG, SVG</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  onChange({ ...settings, logoData: reader.result })
                }
                reader.readAsDataURL(file)
                e.target.value = ''
              }}
            />
          </label>
        )}

        {settings.logoData && (
          <>
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Logo Size: {settings.logoWidth}px
              </label>
              <input
                type="range"
                min="40"
                max="300"
                step="10"
                value={settings.logoWidth}
                onChange={(e) => onChange({ ...settings, logoWidth: parseInt(e.target.value, 10) })}
                className="w-full accent-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Logo Lightness: {settings.logoOpacity}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.logoOpacity}
                onChange={(e) => onChange({ ...settings, logoOpacity: parseInt(e.target.value, 10) })}
                className="w-full accent-primary-600"
              />
              <p className="text-xs text-neutral-400 mt-0.5">Lower = more faded/subtle</p>
            </div>
          </>
        )}
      </div>

      {/* Cover page templates */}
      <div className="border-t border-neutral-200 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-800 text-sm uppercase tracking-wide">Cover Page</h3>
          {coverPage && (
            <button type="button" onClick={() => onCoverPageChange(null)} className="text-xs text-red-500 hover:text-red-700">
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-neutral-500">Choose a banner style, then edit your cover details below.</p>
        <div className="grid grid-cols-2 gap-2">
          {COVER_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => updateCover(template.id)}
              className={`rounded-md border p-2 text-left transition-colors ${
                coverPage?.templateId === template.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-neutral-200 bg-white hover:border-primary-300'
              }`}
            >
              <div className="text-xs font-semibold text-neutral-800">{template.name}</div>
              <div className="text-[10px] leading-tight text-neutral-500 mt-1">{template.description}</div>
            </button>
          ))}
        </div>

        {coverPage && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Cover Logo</label>
              {coverLogoData ? (
                <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-2">
                  <img
                    src={coverLogoData}
                    alt="Cover logo preview"
                    className="h-10 max-w-[120px] object-contain rounded bg-white p-1"
                  />
                  <button
                    type="button"
                    onClick={() => updateCover(selectedTemplate.id, fields, null, coverLogoWidth)}
                    className="ml-auto text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-neutral-300 px-3 py-3 text-xs text-neutral-500 hover:border-primary-400 hover:bg-primary-50">
                  <span className="text-lg">&#128247;</span>
                  <span>Upload logo for this cover page</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => updateCover(selectedTemplate.id, fields, reader.result)
                      reader.readAsDataURL(file)
                      event.target.value = ''
                    }}
                  />
                </label>
              )}
              <p className="mt-1 text-[10px] text-neutral-400">This logo is shown above all cover text.</p>
              {coverLogoData && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Cover Logo Size: {coverLogoWidth}px
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="300"
                    step="10"
                    value={coverLogoWidth}
                    onChange={(event) => updateCover(
                      selectedTemplate.id,
                      fields,
                      coverLogoData,
                      parseInt(event.target.value, 10),
                    )}
                    className="w-full accent-primary-600"
                  />
                </div>
              )}
            </div>

            {[
              ['title', 'Title', 'Document title...'],
              ['subtitle', 'Subtitle', 'Subtitle or tagline...'],
              ['author', 'Author', 'Author name...'],
              ['date', 'Date', 'Date...'],
            ].map(([key, label, placeholder]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
                <input
                  type="text"
                  value={fields[key]}
                  placeholder={placeholder}
                  onChange={(event) => updateCover(selectedTemplate.id, { ...fields, [key]: event.target.value })}
                  className="w-full px-2.5 py-2 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
