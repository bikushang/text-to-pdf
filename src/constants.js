export const PAGE_SIZES = {
  A4: { label: 'A4', width: 210, height: 297 },
  Letter: { label: 'Letter', width: 216, height: 279 },
  Legal: { label: 'Legal', width: 216, height: 356 },
  A3: { label: 'A3', width: 297, height: 420 },
  A5: { label: 'A5', width: 148, height: 210 },
}

export const ORIENTATIONS = {
  portrait: { label: 'Portrait' },
  landscape: { label: 'Landscape' },
}

export const MARGIN_PRESETS = {
  none: { label: 'None', top: 0, right: 0, bottom: 0, left: 0 },
  narrow: { label: 'Narrow', top: 12, right: 12, bottom: 12, left: 12 },
  normal: { label: 'Normal', top: 25, right: 25, bottom: 25, left: 25 },
  wide: { label: 'Wide', top: 50, right: 50, bottom: 50, left: 50 },
}

export const COVER_MARGIN_PRESETS = {
  none: { label: 'None', top: 0, right: 0, bottom: 0, left: 0 },
  narrow: { label: 'Narrow', top: 10, right: 10, bottom: 10, left: 10 },
  normal: { label: 'Normal', top: 20, right: 20, bottom: 20, left: 20 },
  wide: { label: 'Wide', top: 40, right: 40, bottom: 40, left: 40 },
}

export const FONT_FAMILIES = {
  Inter: 'Inter, system-ui, sans-serif',
  'Times New Roman': '"Times New Roman", Times, serif',
  Georgia: 'Georgia, serif',
  Arial: 'Arial, Helvetica, sans-serif',
  Courier: '"Courier New", Courier, monospace',
  Helvetica: 'Helvetica, Arial, sans-serif',
  Verdana: 'Verdana, Geneva, sans-serif',
  'Trebuchet MS': '"Trebuchet MS", sans-serif',
}

export const FONT_SIZES = [
  '8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '72px',
]

export const TEXT_COLORS = [
  '#000000', '#374151', '#6b7280', '#ef4444', '#f97316', '#f59e0b',
  '#10b981', '#059669', '#3b82f6', '#2563eb', '#7c3aed', '#db2777',
  '#ffffff', '#fef3c7', '#dbeafe', '#d1fae5',
]

export const BG_COLORS = [
  '#ffffff', '#fefce8', '#fef3c7', '#ecfeff', '#f0fdf4', '#fdf4ff',
  '#fff7ed', '#f5f5f4', '#f8fafc', '#fce7f3',
]

export function getPageDimensions(pageSize, orientation) {
  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.A4
  const w = orientation === 'landscape' ? size.height : size.width
  const h = orientation === 'landscape' ? size.width : size.height
  return { widthMm: w, heightMm: h }
}

export function mmToPx(mm, dpi = 96) {
  return (mm / 25.4) * dpi
}

export function pxToMm(px, dpi = 96) {
  return (px / dpi) * 25.4
}
