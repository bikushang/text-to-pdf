import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getPageDimensions, mmToPx, MARGIN_PRESETS, COVER_MARGIN_PRESETS, FONT_FAMILIES } from '../constants'

function normalizeCoverHtml(html, heightPx, margins) {
  const usableHeight = Math.max(
    0,
    heightPx - mmToPx(margins.top + margins.bottom),
  )
  return (html || '').replace(
    /min-height\s*:\s*100vh/gi,
    `min-height:${usableHeight}px`,
  )
}

function hasMeaningfulPixels(canvas, yOffset, sliceHeight, backgroundColor) {
  if (
    !canvas ||
    canvas.width <= 0 ||
    canvas.height <= 0 ||
    yOffset >= canvas.height ||
    sliceHeight <= 0
  ) {
    return false
  }

  const match = /^#([0-9a-f]{6})$/i.exec(backgroundColor || '')
  if (!match) return true

  const background = [
    parseInt(match[1].slice(0, 2), 16),
    parseInt(match[1].slice(2, 4), 16),
    parseInt(match[1].slice(4, 6), 16),
  ]
  const context = canvas.getContext('2d')
  const step = 8
  const width = canvas.width
  const height = Math.floor(Math.min(canvas.height - yOffset, sliceHeight))
  if (height <= 0) return false
  const pixels = context.getImageData(0, yOffset, width, height).data

  for (let index = 0; index < pixels.length; index += 4 * step) {
    if (
      Math.abs(pixels[index] - background[0]) > 10 ||
      Math.abs(pixels[index + 1] - background[1]) > 10 ||
      Math.abs(pixels[index + 2] - background[2]) > 10
    ) {
      return true
    }
  }
  return false
}

function createPageContainer(html, settings, widthPx, heightPx, margins, isCover = false) {
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

  const pageHtml = isCover ? normalizeCoverHtml(html, heightPx, margins) : html
  container.innerHTML = styleTag + `<div class="pdf-page-content" style="position:relative; z-index:1;">${pageHtml || '<p style="color:#94a3b8">Empty page...</p>'}</div>`
  return container
}

function collectBreakableBlocks(root, usableHeight) {
  const blocks = []
  const visit = (node) => {
    const children = [...node.children]
    if (
      children.length > 0 &&
      Math.max(node.offsetHeight, node.scrollHeight) > usableHeight
    ) {
      children.forEach(visit)
    } else {
      blocks.push(node)
    }
  }
  ;[...root.children].forEach(visit)
  return blocks
}

async function splitHtmlAtElementBoundaries(html, settings, widthPx, heightPx, margins, isCover) {
  const container = createPageContainer(html, settings, widthPx, heightPx, margins, isCover)
  container.style.minHeight = '0'
  container.style.height = 'auto'
  document.body.appendChild(container)

  try {
    const images = [...container.querySelectorAll('img')]
    await Promise.all(images.map((image) => image.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
          image.onload = resolve
          image.onerror = resolve
        })))

    const content = container.querySelector('.pdf-page-content')
    const usableHeight = Math.max(1, heightPx - mmToPx(margins.top + margins.bottom))
    const blocks = content ? collectBreakableBlocks(content, usableHeight) : []
    if (blocks.length <= 1) return [html || '']

    const chunks = []
    let current = []
    let pageStart = 0
    const contentRect = content.getBoundingClientRect()
    for (const block of blocks) {
      const blockRect = block.getBoundingClientRect()
      const blockTop = blockRect.top - contentRect.top
      const blockBottom = blockTop + blockRect.height
      if (current.length && blockBottom > pageStart + usableHeight) {
        chunks.push(current.join(''))
        current = []
        pageStart += usableHeight
      }
      current.push(block.outerHTML)
    }
    if (current.length) chunks.push(current.join(''))
    return chunks.length ? chunks : [html || '']
  } finally {
    document.body.removeChild(container)
  }
}

/**
 * @param {string[]} pages - Array of HTML page contents
 * @param {object} settings - Document settings
 * @param {object|null} coverPage - Cover page data (if first page is a cover)
 */
export async function generatePDFFromContent(pages, settings, coverPage = null) {
  const { widthMm, heightMm } = getPageDimensions(settings.pageSize, settings.orientation)
  const contentMargins = MARGIN_PRESETS[settings.marginPreset] || MARGIN_PRESETS.normal
  const coverMargins = COVER_MARGIN_PRESETS[settings.coverMarginPreset || 'none'] || COVER_MARGIN_PRESETS.none
  const widthPx = mmToPx(widthMm)
  const heightPx = mmToPx(heightMm)

  const allPages = Array.isArray(pages) ? pages : [pages]
  const hasCover = !!coverPage?.html

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
    for (let i = 0; i < allPages.length; i++) {
      const isCover = hasCover && i === 0
      const margins = isCover ? coverMargins : contentMargins
      const pageContents = await splitHtmlAtElementBoundaries(
        allPages[i], settings, widthPx, heightPx, margins, isCover,
      )

      for (const pageContent of pageContents) {
        const container = createPageContainer(
          pageContent, settings, widthPx, heightPx, margins, isCover,
        )
        document.body.appendChild(container)
        try {
        // Element-boundary pagination has already prepared this chunk. Keep
        // fitting chunks inside one physical page so html2canvas cannot cut a
        // table at an image-slice boundary.
        if (container.scrollHeight <= heightPx + 2) {
          container.style.height = `${heightPx}px`
          container.style.minHeight = `${heightPx}px`
          container.style.overflow = 'hidden'
        } else {
          // A chunk that still overflows is an indivisible oversized element
          // (for example a table taller than one page). Keep it visible so no
          // content is silently removed; normal chunks are always one page.
          container.style.height = `${container.scrollHeight}px`
          container.style.minHeight = `${container.scrollHeight}px`
          container.style.overflow = 'visible'
        }
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: settings.bgColor,
          logging: false,
          windowWidth: container.scrollWidth,
          windowHeight: container.scrollHeight,
        })

        if (hasAddedPage) pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, widthMm, heightMm)
        if (!isCover) stampLogo()
        hasAddedPage = true
        } finally {
          document.body.removeChild(container)
        }
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
