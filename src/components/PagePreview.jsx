import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import {
  getPageDimensions,
  mmToPx,
  MARGIN_PRESETS,
  COVER_MARGIN_PRESETS,
  FONT_FAMILIES,
} from "../constants";

const EMPTY_PAGE_HTML = '<p style="color:#94a3b8">Empty page...</p>';

function normalizeCoverHtml(html, pageHeightPx, margins) {
  const usableHeight = Math.max(
    0,
    pageHeightPx - mmToPx(margins.top + margins.bottom),
  );
  return (html || "").replace(
    /min-height\s*:\s*100vh/gi,
    `min-height:${usableHeight}px`,
  );
}

const sameChunks = (left, right) =>
  left.length === right.length &&
  left.every(
    (chunks, index) => JSON.stringify(chunks) === JSON.stringify(right[index]),
  );

function collectBreakableBlocks(root, usableHeight) {
  const blocks = [];
  const visit = (node) => {
    const children = [...node.children];
    const shouldSplitChildren =
      children.length > 0 &&
      Math.max(node.offsetHeight, node.scrollHeight) > usableHeight;

    if (shouldSplitChildren) {
      children.forEach(visit);
    } else {
      blocks.push(node);
    }
  };

  [...root.children].forEach(visit);
  return blocks;
}

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
  const measureRefs = useRef([]);
  const [pageChunks, setPageChunks] = useState(() =>
    pageList.map((page) => [page || ""]),
  );

  // Measure unconstrained copies of the source pages. Splitting at top-level
  // element boundaries keeps tables and boxed sections together.
  useLayoutEffect(() => {
    let frameId;

    const measurePages = () => {
      const nextChunks = pageList.map((pageContent, index) => {
        const contentEl = measureRefs.current[index];
        if (!contentEl) return [pageContent || ""];

        const margins = hasCover && index === 0 ? coverMargins : contentMargins;
        const measuredHtml =
          hasCover && index === 0
            ? normalizeCoverHtml(pageContent, pageHeightPx, margins)
            : pageContent || "";
        const marginHeight = mmToPx(margins.top + margins.bottom);
        const usableHeight = Math.max(1, pageHeightPx - marginHeight);
        const children = collectBreakableBlocks(contentEl, usableHeight);

        if (!children.length) return [measuredHtml];

        const chunks = [];
        let current = [];
        // Measure from the content container so nested wrappers use the same
        // coordinate system as the page-break boundary.
        let pageStart = 0;
        const contentRect = contentEl.getBoundingClientRect();

        children.forEach((child) => {
          const childRect = child.getBoundingClientRect();
          const childTop = childRect.top - contentRect.top;
          const childBottom = childTop + childRect.height;
          const crossesPage = childBottom > pageStart + usableHeight;

          if (current.length && crossesPage) {
            chunks.push(current.join(""));
            current = [];
            pageStart += usableHeight;
          }
          current.push(child.outerHTML);
        });

        if (current.length) chunks.push(current.join(""));
        return chunks.length ? chunks : [measuredHtml];
      });

      setPageChunks((current) =>
        sameChunks(current, nextChunks) ? current : nextChunks,
      );
    };

    frameId = requestAnimationFrame(measurePages);
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measurePages);
    });
    measureRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [
    pageList,
    pageList.length,
    pageHeightPx,
    settings.defaultFont,
    settings.defaultFontSize,
    contentMargins.top,
    contentMargins.bottom,
    coverMargins.top,
    coverMargins.bottom,
    hasCover,
  ]);

  const getPageStyle = (margins) => ({
    width: pageWidthPx,
    height: pageHeightPx,
    minHeight: pageHeightPx,
    backgroundColor: settings.bgColor,
    padding: `${mmToPx(margins.top)}px ${mmToPx(margins.right)}px ${mmToPx(margins.bottom)}px ${mmToPx(margins.left)}px`,
    fontFamily: FONT_FAMILIES[settings.defaultFont] || FONT_FAMILIES.Inter,
    fontSize: settings.defaultFontSize,
    color: "#1a1a1a",
    lineHeight: 1.6,
    boxSizing: "border-box",
  });

  const getMeasureStyle = (margins) => ({
    ...getPageStyle(margins),
    position: "absolute",
    left: "-100000px",
    top: 0,
    height: "auto",
    minHeight: 0,
    visibility: "hidden",
    overflow: "visible",
  });

  const logo = settings.logoData ? (
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

  let physicalPageNumber = 0;

  return (
    <div className="preview-page-wrapper" ref={ref}>
      {pageList.map((pageContent, index) => {
        const margins = hasCover && index === 0 ? coverMargins : contentMargins;
        return (
          <div
            key={`measure-${index}`}
            ref={(element) => {
              measureRefs.current[index] = element;
            }}
            style={getMeasureStyle(margins)}
            aria-hidden="true"
          >
            <div
              className="preview-content relative"
              dangerouslySetInnerHTML={{
                __html: (
                  hasCover && index === 0
                    ? normalizeCoverHtml(pageContent, pageHeightPx, margins)
                    : pageContent || ""
                ).trim() || EMPTY_PAGE_HTML,
              }}
            />
          </div>
        );
      })}

      {pageChunks.map((chunks, sourceIndex) => {
        const isCover = hasCover && sourceIndex === 0;
        const margins = isCover ? coverMargins : contentMargins;
        const pageStyle = getPageStyle(margins);

        return chunks.map((chunk, chunkIndex) => {
          physicalPageNumber += 1;
          const label =
            isCover && chunkIndex === 0
              ? "Cover"
              : `Page ${physicalPageNumber}`;

          return (
            <div
              key={`page-${sourceIndex}-${chunkIndex}`}
              className="flex flex-col items-center mb-4"
            >
              <div
                className="preview-page-inner"
                style={{ transform: `scale(${scale})` }}
              >
                <div
                  className="bg-white shadow-lg relative overflow-hidden"
                  style={pageStyle}
                >
                  {!isCover && logo}
                  <div
                    className="preview-content relative"
                    style={{ zIndex: 1 }}
                    dangerouslySetInnerHTML={{
                      __html: (
                        isCover
                          ? normalizeCoverHtml(chunk, pageHeightPx, margins)
                          : chunk
                      ).trim() || EMPTY_PAGE_HTML,
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-neutral-400 mt-1">{label}</span>
            </div>
          );
        });
      })}
    </div>
  );
});

export default PagePreview;
