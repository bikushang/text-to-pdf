import { forwardRef } from "react";
import {
  getPageDimensions,
  mmToPx,
  MARGIN_PRESETS,
  COVER_MARGIN_PRESETS,
  FONT_FAMILIES,
} from "../constants";

const PagePreview = forwardRef(function PagePreview(
  { pages, settings, scale = 1, hasCover = false },
  ref,
) {
  const { widthMm, heightMm } = getPageDimensions(
    settings.pageSize,
    settings.orientation,
  );
  const contentMargins =
    MARGIN_PRESETS[settings.marginPreset] || MARGIN_PRESETS.normal;
  const coverMargins =
    COVER_MARGIN_PRESETS[settings.coverMarginPreset || "none"] ||
    COVER_MARGIN_PRESETS.none;

  const pageWidthPx = mmToPx(widthMm);
  const pageHeightPx = mmToPx(heightMm);

  const pageList = Array.isArray(pages) ? pages : [pages];

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
  ) : null;

  return (
    <div className="preview-page-wrapper" ref={ref}>
      {pageList.map((pageContent, idx) => {
        const isCover = hasCover && idx === 0;
        const margins = isCover ? coverMargins : contentMargins;
        const paddingPx = {
          top: mmToPx(margins.top),
          right: mmToPx(margins.right),
          bottom: mmToPx(margins.bottom),
          left: mmToPx(margins.left),
        };

        const pageStyle = {
          width: pageWidthPx,
          minHeight: pageHeightPx,
          backgroundColor: settings.bgColor,
          padding: `${paddingPx.top}px ${paddingPx.right}px ${paddingPx.bottom}px ${paddingPx.left}px`,
          fontFamily:
            FONT_FAMILIES[settings.defaultFont] || FONT_FAMILIES.Inter,
          fontSize: settings.defaultFontSize,
          color: "#1a1a1a",
          lineHeight: 1.6,
          boxSizing: "border-box",
        };

        return (
          <div key={idx} className="flex flex-col items-center mb-4">
            <div
              className="preview-page-inner"
              style={{ transform: `scale(${scale})` }}
            >
              <div
                className="bg-white shadow-lg relative overflow-hidden"
                style={pageStyle}
              >
                {!isCover && logoEl}
                <div
                  className="preview-content relative"
                  style={{ zIndex: 1 }}
                  dangerouslySetInnerHTML={{
                    __html:
                      (pageContent || "").trim() ||
                      '<p style="color:#94a3b8">Empty page...</p>',
                  }}
                />
              </div>
            </div>
            <span className="text-xs text-neutral-400 mt-1">
              {isCover ? "Cover" : `Page ${idx + (hasCover ? 1 : 1)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
});

export default PagePreview;
