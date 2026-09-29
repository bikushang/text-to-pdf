import { useState } from "react";
import { autoFormatContent } from "../utils/autoFormat";

const MODE_TEXT = "text";
const MODE_HTML = "html";

export default function ContentModal({ onSubmit, onCancel }) {
  const [mode, setMode] = useState(MODE_TEXT);
  const [rawContent, setRawContent] = useState("");
  const [docTitle, setDocTitle] = useState("");

  const handleSubmit = () => {
    if (mode === MODE_HTML) {
      const titleHtml = docTitle.trim()
        ? `<h1 style="text-align:center;">${docTitle.trim()}</h1>\n`
        : "";
      onSubmit(titleHtml + rawContent);
      return;
    }
    const formatted = autoFormatContent(rawContent);
    const titleHtml = docTitle.trim()
      ? `<h1 style="text-align:center;">${docTitle.trim()}</h1>\n`
      : "";
    onSubmit(titleHtml + formatted);
  };

  const sampleText = `# My Document Title

## Introduction
This is a sample document. Replace this with your own content.

## Features
- Bold text using **double asterisks**
- Italic text using *single asterisks*
- Links like [click here](https://example.com)

## Steps
1. Type your content here
2. Use # for headings, - for bullets, 1. for numbered lists
3. Use | col1 | col2 | for tables
4. Click Submit to auto-format and open the editor

## Sample Table
| Name | Role |
| John | Developer |
| Jane | Designer |`;

  const sampleHtml = `<h1 style="text-align:center;">My Document Title</h1>
<p style="text-align:center;">A subtitle or description here</p>

<h2>Introduction</h2>
<p>This is a <strong>bold</strong> and <em>italic</em> paragraph. You can use any HTML tags here.</p>

<h2>Features</h2>
<ul>
  <li><strong>Bold text</strong> using strong tags</li>
  <li><em>Italic text</em> using em tags</li>
  <li><a href="https://example.com">Links</a> using anchor tags</li>
</ul>

<h2>Steps</h2>
<ol>
  <li>Type your HTML content here</li>
  <li>Use standard HTML tags for formatting</li>
  <li>Click Submit to open the editor</li>
</ol>

<h2>Sample Table</h2>
<table>
  <thead>
    <tr><th>Name</th><th>Role</th></tr>
  </thead>
  <tbody>
    <tr><td>John</td><td>Developer</td></tr>
    <tr><td>Jane</td><td>Designer</td></tr>
  </tbody>
</table>

<hr/>

<h2>Second Page</h2>
<p>Use hr tags to create page breaks between pages.</p>`;

  return (
    <div className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              Create Your Document
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              {mode === MODE_TEXT
                ? "Type plain text and it will be auto-formatted with headings, bold, lists, and tables."
                : "Write raw HTML code to create your document with full control over formatting."}
            </p>
          </div>
          <button onClick={onCancel} className="btn-icon">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 px-6 pt-4">
          <button
            type="button"
            onClick={() => setMode(MODE_TEXT)}
            className={`btn btn-sm ${mode === MODE_TEXT ? "btn-primary" : "btn-secondary"}`}
          >
            <i className="bi bi-textarea-t"></i> Plain Text (Auto-Format)
          </button>
          <button
            type="button"
            onClick={() => setMode(MODE_HTML)}
            className={`btn btn-sm ${mode === MODE_HTML ? "btn-primary" : "btn-secondary"}`}
          >
            <i className="bi bi-code-slash"></i> HTML Code
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="form-label">Document Title (optional)</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Enter a title for your document..."
              className="input-field"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="form-label">
                {mode === MODE_HTML ? "HTML Code" : "Content"}
              </label>
              <button
                type="button"
                onClick={() =>
                  setRawContent(mode === MODE_HTML ? sampleHtml : sampleText)
                }
                className="btn btn-xs btn-secondary"
              >
                <i className="bi bi-file-earmark-text"></i> Load sample
              </button>
            </div>
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder={
                mode === MODE_HTML
                  ? "Type your HTML code here...\n\n<h1>Heading</h1>\n<p>Paragraph with <strong>bold</strong> text</p>\n<ul><li>Item</li></ul>\n<table><tr><td>Cell</td></tr></table>\n<hr/> for page break"
                  : "Type your content here...\n\nUse # for headings\nUse - for bullet points\nUse 1. for numbered lists\nUse **text** for bold\nUse *text* for italic\nUse | col1 | col2 | for tables"
              }
              className={`input-field h-72 resize-none leading-relaxed ${
                mode === MODE_HTML ? "font-mono" : ""
              }`}
            />
          </div>

          {/* Formatting hints */}
          {mode === MODE_TEXT ? (
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">
                Formatting Guide
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                <div>
                  <code className="bg-neutral-200 px-1 rounded"># Heading</code>{" "}
                  — Large heading
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">
                    ## Subheading
                  </code>{" "}
                  — Medium heading
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">- item</code> —
                  Bullet list
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">1. item</code> —
                  Numbered list
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">**bold**</code>{" "}
                  — Bold text
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">*italic*</code>{" "}
                  — Italic text
                </div>
                <div className="col-span-2">
                  <code className="bg-neutral-200 px-1 rounded">
                    | Col1 | Col2 |
                  </code>{" "}
                  — Table (each row on a new line)
                </div>
                <div className="col-span-2">
                  <code className="bg-neutral-200 px-1 rounded">
                    [link text](url)
                  </code>{" "}
                  — Hyperlink
                </div>
                <div className="col-span-2">
                  <code className="bg-neutral-200 px-1 rounded">---</code> —
                  Page break
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">
                HTML Tags Guide
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                <div>
                  <code className="bg-neutral-200 px-1 rounded">
                    &lt;h1&gt;
                  </code>{" "}
                  to{" "}
                  <code className="bg-neutral-200 px-1 rounded">
                    &lt;h3&gt;
                  </code>{" "}
                  — Headings
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">&lt;p&gt;</code>{" "}
                  — Paragraph
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">
                    &lt;strong&gt;
                  </code>{" "}
                  — Bold
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">
                    &lt;em&gt;
                  </code>{" "}
                  — Italic
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">
                    &lt;ul&gt;&lt;li&gt;
                  </code>{" "}
                  — Bullet list
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">
                    &lt;ol&gt;&lt;li&gt;
                  </code>{" "}
                  — Numbered list
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">
                    &lt;table&gt;
                  </code>{" "}
                  — Table
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">
                    &lt;a href&gt;
                  </code>{" "}
                  — Link
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">
                    &lt;img src&gt;
                  </code>{" "}
                  — Image
                </div>
                <div>
                  <code className="bg-neutral-200 px-1 rounded">
                    &lt;hr/&gt;
                  </code>{" "}
                  — Page break
                </div>
                <div className="col-span-2">
                  Use{" "}
                  <code className="bg-neutral-200 px-1 rounded">
                    style="text-align:center"
                  </code>{" "}
                  for alignment
                </div>
                <div className="col-span-2">
                  Use{" "}
                  <code className="bg-neutral-200 px-1 rounded">
                    style="color:red"
                  </code>{" "}
                  for text color
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            {rawContent.trim()
              ? `${rawContent.trim().split("\n").length} lines`
              : "Start typing to begin"}
          </p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="btn btn-secondary">
              <i className="bi bi-x-lg"></i> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!rawContent.trim()}
              className="btn btn-primary"
            >
              <i className="bi bi-box-arrow-in-right"></i> Submit & Open Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
