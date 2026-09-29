import {
  PAGE_SIZES,
  ORIENTATIONS,
  MARGIN_PRESETS,
  COVER_MARGIN_PRESETS,
  BG_COLORS,
  FONT_FAMILIES,
} from "../constants";
import {
  COVER_TEMPLATES,
  COVER_COLOR_PRESETS,
  DEFAULT_COVER_FIELDS,
  generateCoverPage,
} from "./CoverPageModal";

export default function DocumentSettings({
  settings,
  onChange,
  coverPage,
  onCoverPageChange,
}) {
  const coverFields = { ...DEFAULT_COVER_FIELDS, ...(coverPage?.fields || {}) };
  const selectedTemplateId = coverPage?.templateId || COVER_TEMPLATES[0].id;

  const updateCover = (nextFields) => {
    const merged = { ...coverFields, ...nextFields };
    onCoverPageChange({
      templateId: selectedTemplateId,
      fields: merged,
      html: generateCoverPage(selectedTemplateId, merged),
    });
  };

  const selectTemplate = (templateId) => {
    onCoverPageChange({
      templateId,
      fields: coverFields,
      html: generateCoverPage(templateId, coverFields),
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateCover({ logoData: reader.result });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleWatermarkUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...settings, logoData: reader.result });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
      <h3 className="font-bold text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
        <i className="bi bi-gear-fill text-primary-600"></i> Document Settings
      </h3>

      <div>
        <label className="form-label">Page Size</label>
        <select
          value={settings.pageSize}
          onChange={(e) => onChange({ ...settings, pageSize: e.target.value })}
          className="select-field"
        >
          {Object.entries(PAGE_SIZES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label} ({val.width}x{val.height}mm)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Orientation</label>
        <div className="flex gap-2">
          {Object.entries(ORIENTATIONS).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...settings, orientation: key })}
              className={`btn btn-sm flex-1 ${settings.orientation === key ? "btn-primary" : "btn-secondary"}`}
            >
              <i
                className={`bi ${key === "portrait" ? "bi-file-earmark" : "bi-file-earmark-landscape"}`}
              ></i>
              {val.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Content Margins</label>
        <select
          value={settings.marginPreset}
          onChange={(e) => {
            const preset = MARGIN_PRESETS[e.target.value];
            onChange({
              ...settings,
              marginPreset: e.target.value,
              margins: preset,
            });
          }}
          className="select-field"
        >
          {Object.entries(MARGIN_PRESETS).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Page Background</label>
        <div className="flex flex-wrap gap-1.5">
          {BG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...settings, bgColor: c })}
              className={`w-7 h-7 rounded-lg border-2 transition-all ${settings.bgColor === c ? "border-primary-600 scale-110" : "border-neutral-300"}`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Default Font</label>
        <select
          value={settings.defaultFont}
          onChange={(e) =>
            onChange({ ...settings, defaultFont: e.target.value })
          }
          className="select-field"
        >
          {Object.keys(FONT_FAMILIES).map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Default Font Size</label>
        <select
          value={settings.defaultFontSize}
          onChange={(e) =>
            onChange({ ...settings, defaultFontSize: e.target.value })
          }
          className="select-field"
        >
          {["12px", "14px", "16px", "18px", "20px"].map((s) => (
            <option key={s} value={s}>
              {s.replace("px", "")}pt
            </option>
          ))}
        </select>
      </div>

      {/* Watermark Logo */}
      <div className="border-t border-neutral-200 pt-4 space-y-3">
        <h3 className="font-bold text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <i className="bi bi-water text-primary-600"></i> Watermark Logo
        </h3>

        {settings.logoData ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={settings.logoData}
              alt="Logo preview"
              className="max-h-20 max-w-full object-contain border border-neutral-200 rounded-lg p-1 bg-white"
            />
            <button
              type="button"
              onClick={() => onChange({ ...settings, logoData: null })}
              className="btn btn-xs btn-danger"
            >
              <i className="bi bi-trash"></i> Remove
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-1 w-full py-4 px-3 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
            <i className="bi bi-image text-2xl text-neutral-400"></i>
            <span className="text-xs text-neutral-500 text-center">
              Upload watermark logo
            </span>
            <span className="text-xs text-neutral-400">PNG, JPG, SVG</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleWatermarkUpload}
            />
          </label>
        )}

        {settings.logoData && (
          <>
            <div>
              <label className="form-label">
                Logo Size: {settings.logoWidth}px
              </label>
              <input
                type="range"
                min="40"
                max="300"
                step="10"
                value={settings.logoWidth}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    logoWidth: parseInt(e.target.value, 10),
                  })
                }
                className="range-field"
              />
            </div>
            <div>
              <label className="form-label">
                Logo Lightness: {settings.logoOpacity}%
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={settings.logoOpacity}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    logoOpacity: parseInt(e.target.value, 10),
                  })
                }
                className="range-field"
              />
              <p className="text-xs text-neutral-400 mt-0.5">
                Lower = more faded/subtle
              </p>
            </div>
          </>
        )}
      </div>

      {/* Cover Page */}
      <div className="border-t border-neutral-200 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <i className="bi bi-bookmark-star-fill text-primary-600"></i> Cover
            Page
          </h3>
          {coverPage && (
            <button
              type="button"
              onClick={() => onCoverPageChange(null)}
              className="btn btn-xs btn-danger"
            >
              <i className="bi bi-x-lg"></i> Remove
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {COVER_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => selectTemplate(template.id)}
              className={`rounded-lg border p-2 text-left transition-all ${coverPage?.templateId === template.id ? "border-primary-600 bg-primary-50 ring-1 ring-primary-300" : "border-neutral-200 bg-white hover:border-primary-300"}`}
            >
              <div className="text-xs font-semibold text-neutral-800">
                {template.name}
              </div>
              <div className="text-[10px] leading-tight text-neutral-500 mt-1">
                {template.description}
              </div>
            </button>
          ))}
        </div>

        {coverPage && (
          <div className="space-y-3 pt-1">
            {/* Cover Logo Upload */}
            <div>
              <label className="form-label-sm">Cover Logo</label>
              {coverFields.logoData ? (
                <div className="flex items-center gap-2">
                  <img
                    src={coverFields.logoData}
                    alt="Cover logo"
                    className="h-12 w-12 object-contain border border-neutral-200 rounded-lg p-0.5 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => updateCover({ logoData: null })}
                    className="btn btn-xs btn-danger"
                  >
                    <i className="bi bi-trash"></i> Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-1 w-full py-2.5 px-3 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <i className="bi bi-image text-neutral-400"></i>
                  <span className="text-xs text-neutral-500">
                    Upload logo for cover
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              )}
            </div>

            {/* Logo Size */}
            {coverFields.logoData && (
              <div>
                <label className="form-label-sm">
                  Cover Logo Size: {coverFields.logoWidth}px
                </label>
                <input
                  type="range"
                  min="40"
                  max="600"
                  step="10"
                  value={coverFields.logoWidth}
                  onChange={(e) =>
                    updateCover({ logoWidth: parseInt(e.target.value, 10) })
                  }
                  className="range-field"
                />
              </div>
            )}

            {/* Cover Margins */}
            <div>
              <label className="form-label-sm">Cover Margins</label>
              <select
                value={settings.coverMarginPreset || "none"}
                onChange={(e) =>
                  onChange({ ...settings, coverMarginPreset: e.target.value })
                }
                className="select-field select-sm"
              >
                {Object.entries(COVER_MARGIN_PRESETS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-400 mt-0.5">
                Separate from content margins
              </p>
            </div>

            {/* Color Presets */}
            <div>
              <label className="form-label-sm">Color Theme</label>
              <div className="grid grid-cols-6 gap-1.5">
                {COVER_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    title={preset.name}
                    onClick={() =>
                      updateCover({
                        accentColor: preset.accent,
                        bgColor: preset.bg,
                      })
                    }
                    className="h-7 rounded-md border-2 transition-all overflow-hidden relative"
                    style={{
                      borderColor:
                        coverFields.accentColor === preset.accent
                          ? "#1e293b"
                          : "transparent",
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${preset.bg} 50%, ${preset.accent} 50%)`,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="form-label-sm">Accent Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={coverFields.accentColor}
                    onChange={(e) =>
                      updateCover({ accentColor: e.target.value })
                    }
                    className="color-field color-field-sm"
                  />
                  <input
                    type="text"
                    value={coverFields.accentColor}
                    onChange={(e) =>
                      updateCover({ accentColor: e.target.value })
                    }
                    className="input-field input-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="form-label-sm">Background</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={coverFields.bgColor}
                    onChange={(e) => updateCover({ bgColor: e.target.value })}
                    className="color-field color-field-sm"
                  />
                  <input
                    type="text"
                    value={coverFields.bgColor}
                    onChange={(e) => updateCover({ bgColor: e.target.value })}
                    className="input-field input-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Text Fields */}
            <div className="space-y-2 pt-1 border-t border-neutral-100">
              {[
                ["title", "Title", "Document title..."],
                ["subtitle", "Subtitle", "Subtitle or tagline..."],
                ["author", "Author", "Author name..."],
                ["date", "Date", "Date..."],
              ].map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="form-label-sm">{label}</label>
                  <input
                    type="text"
                    value={coverFields[key]}
                    placeholder={placeholder}
                    onChange={(e) => updateCover({ [key]: e.target.value })}
                    className="input-field input-sm"
                  />
                </div>
              ))}
            </div>

            {/* Font Size Controls */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <label className="form-label-sm flex items-center gap-1">
                <i className="bi bi-fonts"></i> Content Font Sizes
              </label>
              {[
                ["titleSize", "Title Size", 12, 120],
                ["subtitleSize", "Subtitle Size", 8, 80],
                ["authorSize", "Author Size", 8, 60],
                ["dateSize", "Date Size", 8, 50],
              ].map(([key, label, min, max]) => (
                <div key={key}>
                  <label className="form-label-sm">
                    {label}: {coverFields[key]}px
                  </label>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step="1"
                    value={coverFields[key]}
                    onChange={(e) =>
                      updateCover({ [key]: parseInt(e.target.value, 10) })
                    }
                    className="range-field"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
