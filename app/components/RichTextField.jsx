import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { useEffect } from 'react'
import { Text } from '@shopify/polaris'

const ToolbarButton = ({ onClick, active, title, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      padding: '4px 8px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      background: active ? '#e0e0e0' : 'transparent',
      color: '#303030',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '28px',
      height: '28px',
    }}
  >
    {children}
  </button>
)

const Divider = () => (
  <div style={{ width: '1px', background: '#c9cccf', margin: '2px 4px' }} />
)

export default function RichTextField({ label, value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [editor, value])

  if (!editor) return null

  return (
    <div>
      <style>{`
        .tiptap:focus { outline: none; }
        .tiptap p { margin: 0 0 8px; }
        .tiptap h1 { font-size: 1.6em; font-weight: bold; margin: 0 0 8px; }
        .tiptap h2 { font-size: 1.3em; font-weight: bold; margin: 0 0 8px; }
        .tiptap h3 { font-size: 1.1em; font-weight: bold; margin: 0 0 8px; }
        .tiptap ul, .tiptap ol { padding-left: 20px; margin: 0 0 8px; }
      `}</style>
      {label && (
        <div style={{ marginBottom: '4px' }}>
          <Text variant="bodySm" as="p">{label}</Text>
        </div>
      )}

      <div style={{
        border: '1px solid #c9cccf',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff',
      }}>
        {/* ── Toolbar ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2px',
          padding: '6px 8px',
          borderBottom: '1px solid #e1e3e5',
          background: '#fff',
        }}>
          {/* Paragraph/Heading select */}
          <select
            onChange={(e) => {
              const val = e.target.value
              if (val === 'paragraph') editor.chain().focus().setParagraph().run()
              else editor.chain().focus().toggleHeading({ level: parseInt(val) }).run()
            }}
            value={
              editor.isActive('heading', { level: 1 }) ? '1' :
              editor.isActive('heading', { level: 2 }) ? '2' :
              editor.isActive('heading', { level: 3 }) ? '3' : 'paragraph'
            }
            style={{
              padding: '3px 6px', border: '1px solid #e1e3e5',
              borderRadius: '4px', fontSize: '13px',
              cursor: 'pointer', background: '#fff',
            }}
          >
            <option value="paragraph">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>

          <Divider />

          {/* Bold, Italic, Underline, Strike */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
            <s>S</s>
          </ToolbarButton>

          <Divider />

          {/* Alignment */}
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">≡</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">≡</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">≡</ToolbarButton>

          <Divider />

          {/* Lists */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">• ≡</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">1. ≡</ToolbarButton>

        </div>

        {/* ── Editor area ── */}
        <div style={{ padding: '12px', minHeight: '150px', fontSize: '14px', lineHeight: '1.6' }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
