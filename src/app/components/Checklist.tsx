"use client";

import { useState } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  category: string;
}

interface ChecklistProps {
  items: ChecklistItem[];
}

export default function Checklist({ items: initial }: ChecklistProps) {
  const [items, setItems] = useState(initial);

  const toggle = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  };

  const byCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="space-y-4">
      {Object.entries(byCategory).map(([cat, catItems]) => (
        <div key={cat}>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-2">
            {cat}
          </h4>
          <div className="space-y-2">
            {catItems.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggle(item.id)}
                  className="mt-0.5 w-4 h-4 rounded border-surface-700 bg-surface-900 text-brand-500 focus:ring-brand-500"
                />
                <span
                  className={`text-sm ${
                    item.done ? "text-surface-500 line-through" : "text-surface-200"
                  }`}
                >
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
