"use client";

interface ListEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export default function ListEditor({
  label,
  items,
  onChange,
  placeholder = "Add item...",
}: ListEditorProps) {
  const update = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...items, ""]);
  };

  return (
    <div className="space-y-2">
      <label className="grimoire-label">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="grimoire-input flex-1"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-grimoire-danger hover:text-red-400 px-2"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-xs text-grimoire-accent hover:underline"
      >
        + Add
      </button>
    </div>
  );
}
