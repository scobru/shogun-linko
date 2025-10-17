import { useTranslation } from 'react-i18next';
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
          placeholder={t('components.link.titlePlaceholder')}
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
          placeholder={t('components.link.urlPlaceholder')}
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
            {t('components.link.icon')}
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
            <option value="">{t('components.link.icons.none')}</option>
            <option value="fas fa-globe">{t('components.link.icons.globe')}</option>
            <option value="fab fa-instagram">{t('components.link.icons.instagram')}</option>
            <option value="fab fa-linkedin">{t('components.link.icons.linkedin')}</option>
            <option value="fab fa-youtube">{t('components.link.icons.youtube')}</option>
            <option value="fab fa-twitter">{t('components.link.icons.twitter')}</option>
            <option value="fab fa-github">{t('components.link.icons.github')}</option>
            <option value="fas fa-music">{t('components.link.icons.music')}</option>
            <option value="fas fa-envelope">{t('components.link.icons.email')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

