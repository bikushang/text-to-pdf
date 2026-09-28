import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useRef } from 'react'
import StarterKit from '@tiptap/starter-kit'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle, Color, FontFamily, FontSize } from '@tiptap/extension-text-style'
import { Image } from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { Placeholder } from '@tiptap/extension-placeholder'
import { FONT_FAMILIES, FONT_SIZES, TEXT_COLORS } from '../constants'

function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1.5 rounded text-sm transition-colors ${
        active
          ? 'bg-primary-600 text-white'
          : 'text-neutral-700 hover:bg-neutral-200'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-neutral-300 mx-1" />
}

export default function RichTextEditor({ content, onChange, editorRef, remountKey, pages, activePageIndex, onAddPage, onRemovePage, onSelectPage }) {
  const lastEditorHtml = useRef(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      FontFamily.configure({ types: ['textStyle'] }),
      FontSize.configure({ types: ['textStyle'] }),
      Image.configure({ inline: false, allowBase64: true }),
      TableKit.configure({ resizable: false }),
      Placeholder.configure({ placeholder: 'Start writing your document...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      lastEditorHtml.current = html
      onChange(html)
    },
  }, [remountKey])

  useEffect(() => {
    if (!editor) return
    if (content !== lastEditorHtml.current) {
      editor.commands.setContent(content || '', false)
      lastEditorHtml.current = content
    }
  }, [content, editor])

  if (editorRef) {
    editorRef.current = editor
  }

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96 text-neutral-400">
        Loading editor...
      </div>
    )
  }

  const setFontSize = (size) => {
    editor.chain().focus().setFontSize(size).run()
  }

  const setLink = () => {
    const prevUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', prevUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="border border-neutral-300 rounded-lg overflow-hidden bg-white flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <span className="font-bold">&#8617;</span>
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <span className="font-bold">&#8618;</span>
        </ToolbarButton>
        <Divider />

        <select
          onChange={(e) => {
            const val = e.target.value
            if (val === 'p') editor.chain().focus().setParagraph().run()
            else if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run()
            else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run()
            else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run()
            e.target.value = ''
          }}
          className="px-2 py-1.5 rounded text-sm border border-neutral-300 bg-white text-neutral-700"
          defaultValue=""
          title="Heading style"
        >
          <option value="" disabled>Style</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="px-2 py-1.5 rounded text-sm border border-neutral-300 bg-white text-neutral-700 max-w-[140px]"
          defaultValue="Inter"
          title="Font family"
        >
          {Object.keys(FONT_FAMILIES).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          onChange={(e) => setFontSize(e.target.value)}
          className="px-2 py-1.5 rounded text-sm border border-neutral-300 bg-white text-neutral-700"
          defaultValue="16px"
          title="Font size"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s.replace('px', '')}</option>
          ))}
        </select>

        <Divider />

        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span className="line-through">S</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          &#8801;
        </ToolbarButton>
        <ToolbarButton title="Align Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          &#8801;
        </ToolbarButton>
        <ToolbarButton title="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          &#8801;
        </ToolbarButton>
        <ToolbarButton title="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          &#8801;
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          &#8226;
        </ToolbarButton>
        <ToolbarButton title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Text Color" onClick={() => {
          const color = window.prompt('Enter color (hex or name):', '#000000')
          if (color) editor.chain().focus().setColor(color).run()
        }}>
          <span className="text-primary-600 font-bold">A</span>
        </ToolbarButton>

        <div className="flex items-center gap-0.5">
          {TEXT_COLORS.slice(0, 8).map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => editor.chain().focus().setColor(c).run()}
              className="w-5 h-5 rounded border border-neutral-300"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <Divider />

        <ToolbarButton title="Insert Link" active={editor.isActive('link')} onClick={setLink}>
          &#128279;
        </ToolbarButton>
        <ToolbarButton title="Insert Image by URL" onClick={addImage}>
          &#128247;
        </ToolbarButton>
        <label title="Upload Image" className="px-2 py-1.5 rounded text-sm text-neutral-700 hover:bg-neutral-200 cursor-pointer">
          &#128247;
          <input type="file" accept="image/*" onChange={addImageFile} className="hidden" />
        </label>

        <Divider />

        <ToolbarButton title="Insert Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          &#9638;
        </ToolbarButton>
        <ToolbarButton title="Add Row Before" onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>
          Row+
        </ToolbarButton>
        <ToolbarButton title="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>
          &#128465;
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Clear Formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          &#10799;
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="prose-editor" />
      </div>

      {/* Page tabs bar */}
      <div className="flex items-center gap-1 p-2 bg-neutral-50 border-t border-neutral-200 overflow-x-auto">
        {(pages || ['']).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPage(idx)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              idx === activePageIndex
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            Page {idx + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={onAddPage}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 transition-colors whitespace-nowrap"
          title="Add a new blank page"
        >
          + New Page
        </button>
        {pages && pages.length > 1 && (
          <button
            type="button"
            onClick={onRemovePage}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-300 hover:bg-red-100 transition-colors whitespace-nowrap"
            title="Remove current page"
          >
            Remove Page
          </button>
        )}
      </div>
    </div>
  )
}
