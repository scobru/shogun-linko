import { useTranslation } from 'react-i18next';
import type { ComponentData } from '../../types';

interface H1ComponentProps {
  data: ComponentData;
  onUpdate: (data: Partial<ComponentData>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export default function H1Component({
  data,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: H1ComponentProps) {
  const { t } = useTranslation();
  
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
          title="Sposta su"
        >
          <i className="fas fa-chevron-up"></i>
        </button>
        <button
          onClick={onMoveDown}
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs hover:scale-110 transition"
          style={{ backgroundColor: 'var(--linktree-secondary)', color: 'var(--linktree-surface)' }}
          title="Sposta giù"
        >
          <i className="fas fa-chevron-down"></i>
        </button>
        <button
          onClick={onRemove}
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs hover:scale-110 transition"
          style={{ backgroundColor: 'var(--linktree-accent)', color: 'var(--linktree-surface)' }}
          title="Rimuovi"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Alignment selector */}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs" style={{ color: 'var(--linktree-text-secondary)' }}>
          {t('components.alignment')}:
        </label>
        <select
          value={data.alignment || 'center'}
          onChange={(e) => onUpdate({ alignment: e.target.value as any })}
          className="text-xs border rounded px-2 py-1"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            color: 'var(--linktree-text-primary)',
            borderColor: 'var(--linktree-outline)',
          }}
        >
          <option value="left">{t('components.alignments.left')}</option>
          <option value="center">{t('components.alignments.center')}</option>
          <option value="right">{t('components.alignments.right')}</option>
          <option value="justify">{t('components.alignments.justify')}</option>
        </select>
      </div>

      {/* Content */}
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdate({ content: e.currentTarget.innerHTML })}
        className={`text-2xl font-semibold focus:outline-none w-full text-${data.alignment || 'center'}`}
        style={{ color: 'var(--linktree-text-primary)' }}
        dangerouslySetInnerHTML={{ __html: data.content || '' }}
        data-placeholder={t('components.h1.placeholder')}
      />
    </div>
  );
}

