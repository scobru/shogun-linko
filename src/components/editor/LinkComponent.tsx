import type { ComponentData } from '../../types';

interface LinkComponentProps {
  data: ComponentData;
  onUpdate: (data: Partial<ComponentData>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export default function LinkComponent({
  data,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: LinkComponentProps) {
  return (
    <div
      className="component-wrapper relative p-4 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
      style={{
        backgroundColor: 'var(--linktree-surface)',
        borderColor: 'var(--linktree-outline)',
      }}
      draggable
    >
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

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Titolo del link"
          value={data.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            color: 'var(--linktree-text-primary)',
            borderColor: 'var(--linktree-outline)',
          }}
        />
        <input
          type="url"
          placeholder="https://esempio.com"
          value={data.url || ''}
          onChange={(e) => onUpdate({ url: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            color: 'var(--linktree-text-primary)',
            borderColor: 'var(--linktree-outline)',
          }}
        />
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: 'var(--linktree-text-secondary)' }}>
            Icona:
          </label>
          <select
            value={data.icon || ''}
            onChange={(e) => onUpdate({ icon: e.target.value })}
            className="text-xs border rounded px-2 py-1"
            style={{
              backgroundColor: 'var(--linktree-surface)',
              color: 'var(--linktree-text-primary)',
              borderColor: 'var(--linktree-outline)',
            }}
          >
            <option value="">Nessuna</option>
            <option value="fas fa-globe">Globo</option>
            <option value="fab fa-instagram">Instagram</option>
            <option value="fab fa-linkedin">LinkedIn</option>
            <option value="fab fa-youtube">YouTube</option>
            <option value="fab fa-twitter">Twitter</option>
            <option value="fab fa-github">GitHub</option>
            <option value="fas fa-music">Musica</option>
            <option value="fas fa-envelope">Email</option>
          </select>
        </div>
      </div>
    </div>
  );
}

