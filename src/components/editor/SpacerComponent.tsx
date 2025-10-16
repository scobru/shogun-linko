import type { ComponentData } from '../../types';

interface SpacerComponentProps {
  data: ComponentData;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export default function SpacerComponent({
  data,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SpacerComponentProps) {
  return (
    <div
      className="spacer-component relative"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, var(--linktree-outline) 50%, transparent 100%)',
        height: '2px',
        borderRadius: '1px',
        margin: '16px 0',
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
    </div>
  );
}

