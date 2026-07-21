import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, MoveUp, MoveDown } from 'lucide-react';

export default function RepeatableList({
  title = 'Items',
  items = [],
  onChange,
  renderItemFields,
  createNewItem = () => ({ title: '', order: 0 })
}) {
  const [collapsedMap, setCollapsedMap] = useState({});

  const toggleCollapse = (index) => {
    setCollapsedMap(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleAddItem = () => {
    const newItem = createNewItem();
    newItem.order = items.length + 1;
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 }));
    onChange(updated);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((item, i) => ({ ...item, order: i + 1 }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4 border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h4 className="font-bold text-gray-800 text-sm">{title} ({items.length})</h4>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323] transition-colors"
        >
          <Plus size={14} /> Add New Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
          No items added yet. Click "Add New Item" to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isCollapsed = collapsedMap[index];
            return (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                {/* #N Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-100 select-none">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleCollapse(index)}>
                    <span className="font-mono text-xs font-bold text-[#B3732A] bg-white px-2 py-0.5 rounded border border-gray-200">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      {item.title || item.name || `Sub-item ${index + 1}`}
                    </span>
                    {isCollapsed ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Order Input */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">Order:</span>
                      <input
                        type="number"
                        value={item.order ?? index + 1}
                        onChange={(e) => handleUpdateItem(index, 'order', Number(e.target.value))}
                        className="w-12 px-1.5 py-0.5 text-xs text-center border border-gray-300 rounded bg-white font-bold"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                      title="Move Up"
                    >
                      <MoveUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === items.length - 1}
                      className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                      title="Move Down"
                    >
                      <MoveDown size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 text-red-500 hover:text-red-700 ml-1"
                      title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Body Fields */}
                {!isCollapsed && (
                  <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                    {renderItemFields(item, index, (field, val) => handleUpdateItem(index, field, val))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
