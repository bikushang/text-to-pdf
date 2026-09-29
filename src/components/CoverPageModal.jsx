export const COVER_TEMPLATES = [
  {
    id: "gradient-hero",
    name: "Gradient Hero",
    description: "Full-page gradient with centered logo and title",
    generate: (f) => `
<div style="min-height:100vh; background:linear-gradient(135deg, ${f.bgColor} 0%, ${f.accentColor} 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 40px; margin:0; text-align:center; box-sizing:border-box;">
  ${f.logoData ? `<img src="${f.logoData}" style="width:${f.logoWidth}px; max-width:100%; height:auto; margin-bottom:40px; object-fit:contain;" />` : ""}
  <h1 style="font-size:${f.titleSize}px; font-weight:800; color:#ffffff; margin:0 0 16px 0; line-height:1.15; text-shadow:0 2px 8px rgba(0,0,0,0.15);">${f.title || "Document Title"}</h1>
  <div style="width:80px; height:4px; background:rgba(255,255,255,0.6); border-radius:2px; margin:20px 0;"></div>
  <p style="font-size:${f.subtitleSize}px; color:rgba(255,255,255,0.85); margin:12px 0 0 0;">${f.subtitle || "Subtitle goes here"}</p>
  <div style="margin-top:60px;">
    <p style="font-size:${f.authorSize}px; color:rgba(255,255,255,0.9); font-weight:600; margin:0;">${f.author || "Author Name"}</p>
    <p style="font-size:${f.dateSize}px; color:rgba(255,255,255,0.6); margin:6px 0 0 0;">${f.date || ""}</p>
  </div>
</div>`,
  },
  {
    id: "split-panel",
    name: "Split Panel",
    description: "Color block on left, content on right",
    generate: (f) => `
<div style="display:flex; min-height:100vh; margin:0; box-sizing:border-box;">
  <div style="width:40%; background:${f.accentColor}; display:flex; align-items:center; justify-content:center; padding:40px;">
    ${f.logoData ? `<img src="${f.logoData}" style="width:${f.logoWidth}px; max-width:100%; height:auto; object-fit:contain;" />` : `<div style="color:rgba(255,255,255,0.3); font-size:4em; font-weight:800;">${(f.title || "D")[0]}</div>`}
  </div>
  <div style="flex:1; background:${f.bgColor}; display:flex; flex-direction:column; justify-content:center; padding:60px 50px;">
    <p style="font-size:${Math.round(f.authorSize * 0.75)}px; letter-spacing:4px; text-transform:uppercase; color:${f.accentColor}; font-weight:700; margin:0 0 20px 0;">DUOLINGO</p>
    <h1 style="font-size:${f.titleSize}px; font-weight:800; color:#1a1a1a; margin:0 0 16px 0; line-height:1.15;">${f.title || "Document Title"}</h1>
    <div style="width:60px; height:3px; background:${f.accentColor}; margin:24px 0;"></div>
    <p style="font-size:${f.subtitleSize}px; color:#64748b; margin:0 0 40px 0;">${f.subtitle || "Subtitle goes here"}</p>
    <p style="font-size:${f.authorSize}px; color:#475569; font-weight:600; margin:0;">${f.author || "Author Name"}</p>
    <p style="font-size:${f.dateSize}px; color:#94a3b8; margin:6px 0 0 0;">${f.date || ""}</p>
  </div>
</div>`,
  },
  {
    id: "centered-frame",
    name: "Centered Frame",
    description: "Elegant bordered frame with logo on top",
    generate: (f) => `
<div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:40px; margin:0; background:${f.bgColor}; box-sizing:border-box;">
  <div style="border:3px solid ${f.accentColor}; padding:80px 60px; text-align:center; max-width:600px; width:100%;">
    <div style="border:1px solid ${f.accentColor}; padding:60px 40px;">
      ${f.logoData ? `<img src="${f.logoData}" style="width:${f.logoWidth}px; max-width:100%; height:auto; margin:0 auto 40px; object-fit:contain; display:block;" />` : ""}
      <p style="font-size:${Math.round(f.authorSize * 0.75)}px; letter-spacing:6px; text-transform:uppercase; color:${f.accentColor}; font-weight:700; margin:0 0 24px 0;">${f.author || "Author"}</p>
      <h1 style="font-size:${f.titleSize}px; font-weight:700; color:#1e293b; font-family:Georgia, serif; margin:0 0 20px 0; line-height:1.2;">${f.title || "Document Title"}</h1>
      <div style="width:50px; height:1px; background:${f.accentColor}; margin:28px auto;"></div>
      <p style="font-size:${f.subtitleSize}px; color:#64748b; font-style:italic; margin:0 0 32px 0;">${f.subtitle || "Subtitle goes here"}</p>
      <p style="font-size:${f.dateSize}px; color:#94a3b8; margin:0; letter-spacing:1px;">${f.date || ""}</p>
    </div>
  </div>
</div>`,
  },
  {
    id: "top-bar",
    name: "Top Bar",
    description: "Color bar at top with logo, content below",
    generate: (f) => `
<div style="min-height:100vh; margin:0; background:${f.bgColor}; box-sizing:border-box;">
  <div style="background:${f.accentColor}; padding:30px 40px; display:flex; align-items:center; justify-content:center; min-height:140px;">
    ${f.logoData ? `<img src="${f.logoData}" style="width:${f.logoWidth}px; max-width:100%; height:auto; object-fit:contain;" />` : `<span style="color:rgba(255,255,255,0.5); font-size:${f.authorSize}px; font-weight:600; letter-spacing:2px;">YOUR LOGO</span>`}
  </div>
  <div style="padding:100px 50px; text-align:center;">
    <p style="font-size:${Math.round(f.authorSize * 0.75)}px; letter-spacing:4px; text-transform:uppercase; color:${f.accentColor}; font-weight:700; margin:0 0 24px 0;">DUOLINGO</p>
    <h1 style="font-size:${f.titleSize}px; font-weight:800; color:#0f172a; margin:0 0 20px 0; line-height:1.1;">${f.title || "Document Title"}</h1>
    <div style="width:80px; height:4px; background:${f.accentColor}; margin:30px auto; border-radius:2px;"></div>
    <p style="font-size:${f.subtitleSize}px; color:#64748b; margin:0 0 60px 0;">${f.subtitle || "Subtitle goes here"}</p>
    <p style="font-size:${f.authorSize}px; color:#475569; font-weight:600; margin:0;">${f.author || "Author Name"}</p>
    <p style="font-size:${f.dateSize}px; color:#94a3b8; margin:8px 0 0 0;">${f.date || ""}</p>
  </div>
</div>`,
  },
  {
    id: "dark-elegant",
    name: "Dark Elegant",
    description: "Dark background with gold accent and centered logo",
    generate: (f) => `
<div style="min-height:100vh; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 40px; margin:0; text-align:center; box-sizing:border-box;">
  ${f.logoData ? `<img src="${f.logoData}" style="width:${f.logoWidth}px; max-width:100%; height:auto; margin-bottom:50px; object-fit:contain;" />` : ""}
  <p style="font-size:${Math.round(f.authorSize * 0.75)}px; letter-spacing:6px; text-transform:uppercase; color:${f.accentColor}; font-weight:700; margin:0 0 28px 0;">DUOLINGO</p>
  <h1 style="font-size:${f.titleSize}px; font-weight:700; color:#f8fafc; margin:0 0 24px 0; line-height:1.15;">${f.title || "Document Title"}</h1>
  <div style="width:60px; height:2px; background:${f.accentColor}; margin:32px auto;"></div>
  <p style="font-size:${f.subtitleSize}px; color:#cbd5e1; font-style:italic; margin:0 0 50px 0;">${f.subtitle || "Subtitle goes here"}</p>
  <p style="font-size:${f.authorSize}px; color:#e2e8f0; font-weight:600; margin:0;">${f.author || "Author Name"}</p>
  <p style="font-size:${f.dateSize}px; color:#64748b; margin:8px 0 0 0;">${f.date || ""}</p>
</div>`,
  },
  {
    id: "minimal-accent",
    name: "Minimal Accent",
    description: "Clean white with accent line and left-aligned content",
    generate: (f) => `
<div style="min-height:100vh; background:${f.bgColor}; display:flex; flex-direction:column; justify-content:center; padding:80px 60px; margin:0; box-sizing:border-box;">
  ${f.logoData ? `<img src="${f.logoData}" style="width:${f.logoWidth}px; max-width:100%; height:auto; margin-bottom:50px; object-fit:contain;" />` : ""}
  <div style="width:60px; height:5px; background:${f.accentColor}; margin-bottom:30px; border-radius:3px;"></div>
  <h1 style="font-size:${f.titleSize}px; font-weight:800; color:#0f172a; margin:0 0 20px 0; line-height:1.1;">${f.title || "Document Title"}</h1>
  <p style="font-size:${f.subtitleSize}px; color:#64748b; margin:0 0 50px 0; max-width:500px;">${f.subtitle || "Subtitle goes here"}</p>
  <div style="display:flex; align-items:center; gap:20px; margin-top:20px;">
    <div style="width:40px; height:1px; background:${f.accentColor};"></div>
    <div>
      <p style="font-size:${f.authorSize}px; color:#475569; font-weight:600; margin:0;">${f.author || "Author Name"}</p>
      <p style="font-size:${f.dateSize}px; color:#94a3b8; margin:4px 0 0 0;">${f.date || ""}</p>
    </div>
  </div>
</div>`,
  },
  {
    id: "circle-badge",
    name: "Circle Badge",
    description: "Logo in a circle badge with content below",
    generate: (f) => {
      const badgeSize = Math.min(f.logoWidth + 40, 400);
      return `
<div style="min-height:100vh; background:${f.bgColor}; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 40px; margin:0; text-align:center; box-sizing:border-box;">
  <div style="width:${badgeSize}px; height:${badgeSize}px; border-radius:50%; border:4px solid ${f.accentColor}; display:flex; align-items:center; justify-content:center; margin-bottom:50px; overflow:hidden; padding:20px; box-sizing:border-box;">
    ${f.logoData ? `<img src="${f.logoData}" style="width:100%; height:100%; object-fit:contain;" />` : `<span style="color:${f.accentColor}; font-size:${f.titleSize}px; font-weight:800;">${(f.title || "D")[0]}</span>`}
  </div>
  <h1 style="font-size:${f.titleSize}px; font-weight:800; color:#0f172a; margin:0 0 20px 0; line-height:1.1;">${f.title || "Document Title"}</h1>
  <div style="width:50px; height:3px; background:${f.accentColor}; margin:24px auto; border-radius:2px;"></div>
  <p style="font-size:${f.subtitleSize}px; color:#64748b; margin:0 0 40px 0;">${f.subtitle || "Subtitle goes here"}</p>
  <p style="font-size:${f.authorSize}px; color:#475569; font-weight:600; margin:0;">${f.author || "Author Name"}</p>
  <p style="font-size:${f.dateSize}px; color:#94a3b8; margin:6px 0 0 0;">${f.date || ""}</p>
</div>`;
    },
  },
  {
    id: "diagonal-banner",
    name: "Diagonal Banner",
    description: "Diagonal color band with logo and title",
    generate: (f) => `
<div style="min-height:100vh; background:${f.bgColor}; margin:0; padding:0; box-sizing:border-box; position:relative; overflow:hidden;">
  <div style="position:absolute; top:-100px; left:-100px; right:-100px; height:300px; background:${f.accentColor}; transform:rotate(-5deg); transform-origin:top left;"></div>
  <div style="position:relative; padding:80px 50px; text-align:center; z-index:1;">
    ${f.logoData ? `<img src="${f.logoData}" style="width:${f.logoWidth}px; max-width:100%; height:auto; margin:0 auto 60px; object-fit:contain; display:block; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.2));" />` : ""}
  </div>
  <div style="padding:40px 50px 80px; text-align:center; position:relative; z-index:1;">
    <p style="font-size:${Math.round(f.authorSize * 0.75)}px; letter-spacing:4px; text-transform:uppercase; color:${f.accentColor}; font-weight:700; margin:0 0 24px 0;">DUOLINGO</p>
    <h1 style="font-size:${f.titleSize}px; font-weight:800; color:#0f172a; margin:0 0 24px 0; line-height:1.1;">${f.title || "Document Title"}</h1>
    <div style="width:70px; height:4px; background:${f.accentColor}; margin:30px auto; border-radius:2px;"></div>
    <p style="font-size:${f.subtitleSize}px; color:#64748b; margin:0 0 50px 0;">${f.subtitle || "Subtitle goes here"}</p>
    <p style="font-size:${f.authorSize}px; color:#475569; font-weight:600; margin:0;">${f.author || "Author Name"}</p>
    <p style="font-size:${f.dateSize}px; color:#94a3b8; margin:8px 0 0 0;">${f.date || ""}</p>
  </div>
</div>`,
  },
];

export const COVER_COLOR_PRESETS = [
  { name: "Royal Blue", accent: "#2563eb", bg: "#1e3a5f" },
  { name: "Emerald", accent: "#059669", bg: "#064e3b" },
  { name: "Sunset Orange", accent: "#ea580c", bg: "#7c2d12" },
  { name: "Rose Gold", accent: "#e11d48", bg: "#881337" },
  { name: "Deep Teal", accent: "#0d9488", bg: "#134e4a" },
  { name: "Royal Purple", accent: "#7c3aed", bg: "#4c1d95" },
  { name: "Amber Gold", accent: "#d97706", bg: "#78350f" },
  { name: "Slate Dark", accent: "#38bdf8", bg: "#0f172a" },
  { name: "Forest Green", accent: "#16a34a", bg: "#14532d" },
  { name: "Crimson", accent: "#dc2626", bg: "#7f1d1d" },
  { name: "Indigo Night", accent: "#6366f1", bg: "#1e1b4b" },
  { name: "Coral", accent: "#f97316", bg: "#fff7ed" },
];

export const DEFAULT_COVER_FIELDS = {
  title: "",
  subtitle: "",
  author: "",
  date: new Date().toLocaleDateString(),
  logoData: null,
  logoWidth: 150,
  accentColor: "#2563eb",
  bgColor: "#1e3a5f",
  titleSize: 48,
  subtitleSize: 21,
  authorSize: 16,
  dateSize: 14,
};

export function generateCoverPage(templateId, fields) {
  const template =
    COVER_TEMPLATES.find((t) => t.id === templateId) || COVER_TEMPLATES[0];
  const merged = { ...DEFAULT_COVER_FIELDS, ...fields };
  return template.generate(merged);
}
