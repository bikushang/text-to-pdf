export function autoFormatContent(rawText) {
  if (!rawText || !rawText.trim()) return ''

  const lines = rawText.split('\n').map((l) => l.trimEnd())
  let html = ''
  let inList = false
  let inNumberedList = false
  let tableRows = []
  let paragraphBuffer = []

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(' ')
      html += `<p>${formatInline(text)}</p>\n`
      paragraphBuffer = []
    }
  }

  const flushList = () => {
    if (inList) { html += '</ul>\n'; inList = false }
    if (inNumberedList) { html += '</ol>\n'; inNumberedList = false }
  }

  const flushTable = () => {
    if (tableRows.length > 0) {
      html += '<table>\n<thead>\n<tr>\n'
      const headers = tableRows[0]
      headers.forEach((h) => { html += `<th>${formatInline(h)}</th>\n` })
      html += '</tr>\n</thead>\n<tbody>\n'
      for (let i = 1; i < tableRows.length; i++) {
        html += '<tr>\n'
        tableRows[i].forEach((cell) => { html += `<td>${formatInline(cell)}</td>\n` })
        html += '</tr>\n'
      }
      html += '</tbody>\n</table>\n'
      tableRows = []
    }
  }

  const flushAll = () => {
    flushParagraph()
    flushList()
    flushTable()
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === '') {
      flushAll()
      continue
    }

    // Page break: --- or ___ on its own line
    if (/^(---|___)$/.test(trimmed)) {
      flushAll()
      html += '<hr/>\n'
      continue
    }

    // Table detection: lines with | separators
    if (trimmed.includes('|') && trimmed.split('|').length >= 3) {
      flushParagraph()
      flushList()
      const cells = trimmed.split('|').map((c) => c.trim()).filter((c) => c !== '')
      // Skip separator rows like |---|---|
      if (cells.every((c) => /^[-:]+$/.test(c))) continue
      tableRows.push(cells)
      continue
    } else {
      flushTable()
    }

    // Heading detection: # or ## or ### or ALL CAPS short lines
    if (/^###\s+/.test(trimmed)) {
      flushAll()
      html += `<h3>${formatInline(trimmed.replace(/^###\s+/, ''))}</h3>\n`
      continue
    }
    if (/^##\s+/.test(trimmed)) {
      flushAll()
      html += `<h2>${formatInline(trimmed.replace(/^##\s+/, ''))}</h2>\n`
      continue
    }
    if (/^#\s+/.test(trimmed)) {
      flushAll()
      html += `<h1>${formatInline(trimmed.replace(/^#\s+/, ''))}</h1>\n`
      continue
    }

    // Numbered list: 1. or 1)
    if (/^\d+[.)]\s+/.test(trimmed)) {
      flushParagraph()
      if (!inNumberedList) { flushList(); html += '<ol>\n'; inNumberedList = true }
      html += `<li>${formatInline(trimmed.replace(/^\d+[.)]\s+/, ''))}</li>\n`
      continue
    }

    // Bullet list: - or * or •
    if (/^[-*•]\s+/.test(trimmed)) {
      flushParagraph()
      if (!inList) { flushList(); html += '<ul>\n'; inList = true }
      html += `<li>${formatInline(trimmed.replace(/^[-*•]\s+/, ''))}</li>\n`
      continue
    }

    // All caps short line = heading
    if (trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && !trimmed.endsWith('.')) {
      flushAll()
      html += `<h2>${formatInline(trimmed)}</h2>\n`
      continue
    }

    // Regular paragraph text
    flushList()
    flushTable()
    paragraphBuffer.push(trimmed)
  }

  flushAll()
  return html
}

function formatInline(text) {
  let result = text
  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>')
  // Italic: *text* or _text_
  result = result.replace(/(?<!\w)\*(.+?)\*(?!\w)/g, '<em>$1</em>')
  result = result.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>')
  // Links: [text](url)
  result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
  return result
}
