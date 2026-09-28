import { forwardRef } from 'react'
import { getPageDimensions, mmToPx, MARGIN_PRESETS, FONT_FAMILIES } from '../constants'

const PagePreview = forwardRef(function PagePreview({ pages, settings, scale = 1, coverPageCount = 0 }, ref) {
  const { widthMm, heightMm } = getPageDimensions(settings.pageSize, settings.orientation)
  const margins = MARGIN_PRESETS[settings.marginPreset] || MARGIN_PRESETS.normal

  const pageWidthPx = mmToPx(widthMm)
  const pageHeightPx = mmToPx(heightMm)
  const paddingPx = {
    top: mmToPx(margins.top),
    right: mmToPx(margins.right),
    bottom: mmToPx(margins.bottom),
    left: mmToPx(margins.left),
  }

  const pageStyle = {
    width: pageWidthPx,
    minHeight: pageHeightPx,
    backgroundColor: settings.bgColor,
    padding: `${paddingPx.top}px ${paddingPx.right}px ${paddingPx.bottom}px ${paddingPx.left}px`,
    fontFamily: FONT_FAMILIES[settings.defaultFont] || FONT_FAMILIES.Inter,
    fontSize: settings.defaultFontSize,
    color: '#1a1a1a',
    lineHeight: 1.6,
    boxSizing: 'border-box',
    transformOrigin: 'top center',
    transform: `scale(${scale})`,
    position: 'relative',
  }

  const pageList = Array.isArray(pages) ? pages : [pages]

  const logoEl = settings.logoData ? (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <img
        src={settings.logoData}
        alt="Logo"
        style={{
          width: `${settings.logoWidth}px`,
          opacity: settings.logoOpacity / 100,
        }}
        className="object-contain"
      />
    </div>
  ) : null

  return (
    <div className="flex flex-col items-center gap-4" ref={ref}>
      {pageList.map((pageContent, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="bg-white shadow-lg relative overflow-hidden" style={pageStyle}>
            {idx >= coverPageCount && logoEl}
            <div
              className="preview-content relative"
              style={{ zIndex: 1 }}
              dangerouslySetInnerHTML={{
                __html: (pageContent || '').trim() || '<p style="color:#94a3b8">Empty page...</p>'
              }}
            />
          </div>
          <span className="text-xs text-neutral-400 mt-1">Page {idx + 1}</span>
        </div>
      ))}
    </div>
  )
})

export default PagePreview
