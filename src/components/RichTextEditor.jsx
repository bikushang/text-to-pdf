import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useRef } from "react";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import {
  TextStyle,
  Color,
  FontFamily,
  FontSize,
} from "@tiptap/extension-text-style";
import { Image } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extension-placeholder";
import { FONT_FAMILIES, FONT_SIZES, TEXT_COLORS } from "../constants";

function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`btn-icon ${active ? "active" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-neutral-300 mx-1" />;
}

export default function RichTextEditor({
  content,
  onChange,
  editorRef,
  remountKey,
  pages,
  activePageIndex,
  onAddPage,
  onRemovePage,
  onSelectPage,
}) {
  const lastEditorHtml = useRef(content);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          link: {
            openOnClick: false,
            HTMLAttributes: { rel: "noopener noreferrer" },
          },
        }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TextStyle,
        Color,
        FontFamily.configure({ types: ["textStyle"] }),
        FontSize.configure({ types: ["textStyle"] }),
        Image.configure({ inline: false, allowBase64: true }),
        TableKit.configure({ resizable: false }),
        Placeholder.configure({
          placeholder: "Start writing your document...",
        }),
      ],
      content,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        lastEditorHtml.current = html;
        onChange(html);
      },
    },
    [remountKey],
  );

  useEffect(() => {
    if (!editor) return;
    if (content !== lastEditorHtml.current) {
      editor.commands.setContent(content || "", false);
      lastEditorHtml.current = content;
    }
  }, [content, editor]);

  if (editorRef) {
    editorRef.current = editor;
  }

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96 text-neutral-400">
        <i className="bi bi-arrow-clockwise animate-spin text-2xl mr-2"></i>
        Loading editor...
      </div>
    );
  }

  const setFontSize = (size) => {
    editor.chain().focus().setFontSize(size).run();
  };

  const setLink = () => {
    const prevUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", prevUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="border border-neutral-300 rounded-xl overflow-hidden bg-white flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <i className="bi bi-arrow-counterclockwise"></i>
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <i className="bi bi-arrow-clockwise"></i>
        </ToolbarButton>
        <Divider />

        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p") editor.chain().focus().setParagraph().run();
            else if (val === "h1")
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            else if (val === "h2")
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            else if (val === "h3")
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            e.target.value = "";
          }}
          className="select-field select-sm"
          style={{width: "30rem"}}
          defaultValue=""
          title="Heading style"
        >
          <option value="" disabled>
            Style
          </option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select
          onChange={(e) =>
            editor.chain().focus().setFontFamily(e.target.value).run()
          }
          className="select-field select-sm max-w-[140px]"
          defaultValue="Inter"
          title="Font family"
        >
          {Object.keys(FONT_FAMILIES).map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setFontSize(e.target.value)}
          className="select-field select-sm"
          style={{width: "2rem"}}
          defaultValue="16px"
          title="Font size"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s.replace("px", "")}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <i className="bi bi-type-bold"></i>
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i className="bi bi-type-italic"></i>
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <i className="bi bi-type-underline"></i>
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <i className="bi bi-type-strikethrough"></i>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Align Left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <i className="bi bi-text-left"></i>
        </ToolbarButton>
        <ToolbarButton
          title="Align Center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <i className="bi bi-text-center"></i>
        </ToolbarButton>
        <ToolbarButton
          title="Align Right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <i className="bi bi-text-right"></i>
        </ToolbarButton>
        <ToolbarButton
          title="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <i className="bi bi-justify"></i>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <i className="bi bi-list-ul"></i>
        </ToolbarButton>
        <ToolbarButton
          title="Numbered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <i className="bi bi-list-ol"></i>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Text Color"
          onClick={() => {
            const color = window.prompt(
              "Enter color (hex or name):",
              "#000000",
            );
            if (color) editor.chain().focus().setColor(color).run();
          }}
        >
          <i className="bi bi-palette-fill text-primary-600"></i>
        </ToolbarButton>

        <div className="flex items-center gap-0.5">
          {TEXT_COLORS.slice(0, 8).map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => editor.chain().focus().setColor(c).run()}
              className="w-5 h-5 rounded border border-neutral-300 cursor-pointer"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <Divider />

        <ToolbarButton
          title="Insert Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <i className="bi bi-link-45deg"></i>
        </ToolbarButton>
        <ToolbarButton title="Insert Image by URL" onClick={addImage}>
          <i className="bi bi-link-image"></i>
        </ToolbarButton>
        <label title="Upload Image" className="btn-icon cursor-pointer">
          <i className="bi bi-image-fill"></i>
          <input
            type="file"
            accept="image/*"
            onChange={addImageFile}
            className="hidden"
          />
        </label>

        <Divider />

        <ToolbarButton
          title="Insert Table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <i className="bi bi-table"></i>
        </ToolbarButton>
        <ToolbarButton
          title="Add Row Before"
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editor.can().addRowBefore()}
        >
          <i className="bi bi-plus-lg"></i>
        </ToolbarButton>
        <ToolbarButton
          title="Delete Table"
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
        >
          <i className="bi bi-trash"></i>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Clear Formatting"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <i className="bi bi-eraser"></i>
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="prose-editor" />
      </div>

      {/* Page tabs bar */}
      <div className="flex items-center gap-1 p-2 bg-neutral-50 border-t border-neutral-200 overflow-x-auto">
        {(pages || [""]).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPage(idx)}
            className={`btn btn-xs whitespace-nowrap ${idx === activePageIndex ? "btn-primary" : "btn-secondary"}`}
          >
            <i className="bi bi-file-earmark-text"></i> Page {idx + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={onAddPage}
          className="btn btn-xs btn-success whitespace-nowrap"
          title="Add a new blank page"
        >
          <i className="bi bi-plus-lg"></i> New Page
        </button>
        {pages && pages.length > 1 && (
          <button
            type="button"
            onClick={onRemovePage}
            className="btn btn-xs btn-danger whitespace-nowrap"
            title="Remove current page"
          >
            <i className="bi bi-dash-lg"></i> Remove Page
          </button>
        )}
      </div>
    </div>
  );
}
