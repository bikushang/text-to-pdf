import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getPageDimensions, mmToPx, MARGIN_PRESETS, FONT_FAMILIES } from '../constants'

function createPageContainer(html, settings, widthPx, heightPx, margins, isCoverPage = false) {
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = `${widthPx}px`
  container.style.minHeight = `${heightPx}px`
  container.style.padding = `${mmToPx(margins.top)}px ${mmToPx(margins.right)}px ${mmToPx(margins.bottom)}px ${mmToPx(margins.left)}px`
  container.style.backgroundColor = settings.bgColor
  container.style.fontFamily = FONT_FAMILIES[settings.defaultFont] || FONT_FAMILIES.Inter
  container.style.fontSize = settings.defaultFontSize
  container.style.color = '#1a1a1a'
  container.style.lineHeight = '1.6'
  container.style.boxSizing = 'border-box'

  const logoHtml = settings.logoData && !isCoverPage
    ? `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:0; pointer-events:none;">
         <img src="${settings.logoData}" style="width:${settings.logoWidth}px; opacity:${settings.logoOpacity / 100}; max-width:100%;" />
       </div>`
    : ''

  const styleTag = `<style>
    .pdf-page-content h1 { font-size: 2em; font-weight: 700; line-height: 1.2; margin: 0.67em 0; }
    .pdf-page-content h2 { font-size: 1.5em; font-weight: 700; line-height: 1.2; margin: 0.83em 0; }
    .pdf-page-content h3 { font-size: 1.25em; font-weight: 700; line-height: 1.2; margin: 1em 0; }
    .pdf-page-content p { margin: 0.65em 0; }
    .pdf-page-content strong { font-weight: 700; }
    .pdf-page-content em { font-style: italic; }
    .pdf-page-content ul, .pdf-page-content ol { margin: 0.75em 0; padding-left: 1.75em; }
    .pdf-page-content li { margin: 0.25em 0; }
    .pdf-page-content a { color: #2563eb; text-decoration: underline; }
    .pdf-page-content table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.95em; }
    .pdf-page-content th, .pdf-page-content td { border: 1px solid #94a3b8; padding: 10px 12px; min-width: 40px; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
    .pdf-page-content th { background: #e2e8f0; font-weight: 700; }
    .pdf-page-content tr:nth-child(even) td { background: #f8fafc; }
    .pdf-page-content img { max-width: 100%; height: auto; }
  </style>`

  container.innerHTML = styleTag + logoHtml + `<div class="pdf-page-content" style="position:relative; z-index:1;">${html || '<p style="color:#94a3b8">Empty page...</p>'}</div>`
  return container
}

export async function generatePDFFromContent(pages, settings, { coverPageCount = 0 } = {}) {
  const { widthMm, heightMm } = getPageDimensions(settings.pageSize, settings.orientation)
  const margins = MARGIN_PRESETS[settings.marginPreset] || MARGIN_PRESETS.normal
  const widthPx = mmToPx(widthMm)
  const heightPx = mmToPx(heightMm)
  const pageHeightMm = heightMm - margins.top - margins.bottom
  const imgWidth = widthMm - margins.left - margins.right

  const allPages = Array.isArray(pages) ? pages : [pages]

  const pdf = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: settings.pageSize.toLowerCase(),
  })

  let logoImgData = null
  let logoW = 0
  let logoH = 0
  if (settings.logoData) {
    const logoEl = document.createElement('img')
    logoEl.src = settings.logoData
    await new Promise((resolve) => { logoEl.onload = resolve; logoEl.onerror = resolve })
    const logoCanvas = document.createElement('canvas')
    const logoPx = settings.logoWidth * 2
    const ratio = logoEl.naturalHeight / logoEl.naturalWidth || 1
    logoCanvas.width = logoPx
    logoCanvas.height = logoPx * ratio
    const lctx = logoCanvas.getContext('2d')
    lctx.globalAlpha = settings.logoOpacity / 100
    lctx.drawImage(logoEl, 0, 0, logoCanvas.width, logoCanvas.height)
    logoImgData = logoCanvas.toDataURL('image/png')
    logoW = settings.logoWidth
    logoH = settings.logoWidth * ratio
  }

  const stampLogo = () => {
    if (!logoImgData) return
    const cx = widthMm / 2
    const cy = heightMm / 2
    pdf.addImage(logoImgData, 'PNG', cx - logoW / 2, cy - logoH / 2, logoW, logoH, undefined, 'FAST')
  }

  let hasAddedPage = false
  try {
    for (const [pageIndex, pageHtml] of allPages.entries()) {
      const container = createPageContainer(pageHtml, settings, widthPx, heightPx, margins, pageIndex < coverPageCount)
      document.body.appendChild(container)
      try {
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: settings.bgColor,
          logging: false,
          windowWidth: container.scrollWidth,
          windowHeight: container.scrollHeight,
        })

        const pxPerMm = canvas.width / imgWidth
        const pageHeightPx = pageHeightMm * pxPerMm
        let yOffset = 0

        while (yOffset < canvas.height || (!yOffset && canvas.height === 0)) {
          const sliceCanvas = document.createElement('canvas')
          sliceCanvas.width = canvas.width
          sliceCanvas.height = Math.min(pageHeightPx, Math.max(1, canvas.height - yOffset))
          const ctx = sliceCanvas.getContext('2d')
          ctx.fillStyle = settings.bgColor
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
          ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height)

          if (hasAddedPage) pdf.addPage()
          pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margins.left, margins.top, imgWidth, sliceCanvas.height / pxPerMm)
          if (pageIndex >= coverPageCount) stampLogo()
          hasAddedPage = true
          yOffset += pageHeightPx
          if (canvas.height === 0) break
        }
      } finally {
        document.body.removeChild(container)
      }
    }

    return pdf
  } catch (error) {
    if (!hasAddedPage) pdf.deletePage(1)
    throw error
  }
}

export function downloadPDF(pdf, filename = 'document.pdf') {
  pdf.save(filename)
}
