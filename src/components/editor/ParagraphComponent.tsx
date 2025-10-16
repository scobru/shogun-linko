import type { ComponentData } from '../../types';

interface ParagraphComponentProps {
  data: ComponentData;
  onUpdate: (data: Partial<ComponentData>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export default function ParagraphComponent({
  data,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ParagraphComponentProps) {
  return (
    <div
      className="component-wrapper relative p-4 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
      style={{
        backgroundColor: 'var(--linktree-surface)',
        borderColor: 'var(--linktree-outline)',
      }}
      draggable
    >
      {/* Controls */}
      <div className="absolute -top-3 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={onMoveUp}
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs hover:scale-110 transition"
          style={{ backgroundColor: 'var(--linktree-primary)', color: 'var(--linktree-surface)' }}
        >
          <i className="fas fa-chevron-up"></i>
        </button>
        <button
          onClick={onMoveDown}
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs hover:scale-110 transition"
          style={{ backgroundColor: 'var(--linktree-secondary)', color: 'var(--linktree-surface)' }}
        >
          <i className="fas fa-chevron-down"></i>
        </button>
        <button
          onClick={onRemove}
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs hover:scale-110 transition"
          style={{ backgroundColor: 'var(--linktree-accent)', color: 'var(--linktree-surface)' }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs" style={{ color: 'var(--linktree-text-secondary)' }}>
          Allineamento:
        </label>
        <select
          value={data.alignment || 'justify'}
          onChange={(e) => onUpdate({ alignment: e.target.value as any })}
          className="text-xs border rounded px-2 py-1"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            color: 'var(--linktree-text-primary)',
            borderColor: 'var(--linktree-outline)',
          }}
        >
          <option value="left">Sinistra</option>
          <option value="center">Centro</option>
          <option value="right">Destra</option>
          <option value="justify">Giustificato</option>
        </select>
      </div>

      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdate({ content: e.currentTarget.innerHTML })}
        className={`text-base focus:outline-none w-full text-${data.alignment || 'justify'}`}
        style={{ color: 'var(--linktree-text-secondary)' }}
        dangerouslySetInnerHTML={{ __html: data.content || '' }}
        placeholder="Scrivi il tuo testo qui..."
      />
    </div>
  );
}

