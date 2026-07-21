import React, { useState, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Image as ImageIcon } from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';

export default function RichTextEditor({ value, onChange, placeholder = 'Type content here…' }) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const editorRef = useRef(null);

  const formatDoc = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertImage = ({ url, altText }) => {
    const imgHtml = `<img src="${url}" alt="${altText || ''}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`;
    formatDoc('insertHTML', imgHtml);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#B3732A]/20 focus-within:border-[#B3732A]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 text-gray-700 select-none">
        <button
          type="button"
          onClick={() => formatDoc('bold')}
          className="p-1.5 hover:bg-gray-200 rounded text-xs"
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('italic')}
          className="p-1.5 hover:bg-gray-200 rounded text-xs"
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('underline')}
          className="p-1.5 hover:bg-gray-200 rounded text-xs"
          title="Underline"
        >
          <Underline size={15} />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('strikeThrough')}
          className="p-1.5 hover:bg-gray-200 rounded text-xs"
          title="Strikethrough"
        >
          <Strikethrough size={15} />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => formatDoc('justifyLeft')}
          className="p-1.5 hover:bg-gray-200 rounded text-xs"
          title="Align Left"
        >
          <AlignLeft size={15} />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('justifyCenter')}
          className="p-1.5 hover:bg-gray-200 rounded text-xs"
          title="Align Center"
        >
          <AlignCenter size={15} />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('justifyRight')}
          className="p-1.5 hover:bg-gray-200 rounded text-xs"
          title="Align Right"
        >
          <AlignRight size={15} />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => formatDoc('insertUnorderedList')}
          className="p-1.5 hover:bg-gray-200 rounded text-xs"
          title="Bullet List"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('insertOrderedList')}
          className="p-1.5 hover:bg-gray-200 rounded text-xs"
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => setMediaOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-[#B3732A] hover:bg-amber-100 rounded text-xs font-semibold"
          title="Insert Image"
        >
          <ImageIcon size={14} /> Add Image
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        className="min-h-[160px] p-4 text-sm focus:outline-none leading-relaxed"
      />

      <MediaPickerModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelectImage={handleInsertImage}
      />
    </div>
  );
}
