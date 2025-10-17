import { useTranslation } from 'react-i18next';
import type { ComponentData } from '../../types';

interface AudioComponentProps {
  data: ComponentData;
  onUpdate: (data: Partial<ComponentData>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export default function AudioComponent({
  data,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: AudioComponentProps) {
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

      <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
        <i className="fas fa-music mr-2 text-purple-600"></i>{t('components.audio.title')}
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
            {t('components.audio.urlLabel')}
          </label>
          <input
            type="url"
            placeholder={t('components.audio.urlPlaceholder')}
            value={data.audioUrl || ''}
            onChange={(e) => onUpdate({ audioUrl: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm"
            style={{
              backgroundColor: 'var(--linktree-surface)',
              color: 'var(--linktree-text-primary)',
              borderColor: 'var(--linktree-outline)',
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
            {t('components.audio.titleLabel')}
          </label>
          <input
            type="text"
            placeholder={t('components.audio.titlePlaceholder')}
            value={data.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm"
            style={{
              backgroundColor: 'var(--linktree-surface)',
              color: 'var(--linktree-text-primary)',
              borderColor: 'var(--linktree-outline)',
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
            {t('components.audio.descriptionLabel')}
          </label>
          <textarea
            placeholder={t('components.audio.descriptionPlaceholder')}
            value={data.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm"
            style={{
              backgroundColor: 'var(--linktree-surface)',
              color: 'var(--linktree-text-primary)',
              borderColor: 'var(--linktree-outline)',
            }}
            rows={2}
          />
        </div>
      </div>

      {data.audioUrl && (
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
            {t('components.audio.preview')}
          </h4>
          <div className="text-center">
            <audio
              controls
              className="w-full max-w-sm mx-auto"
              style={{ backgroundColor: 'var(--linktree-surface)' }}
            >
              <source src={data.audioUrl} type="audio/mpeg" />
              <source src={data.audioUrl} type="audio/wav" />
              <source src={data.audioUrl} type="audio/ogg" />
              {t('components.audio.browserNotSupported')}
            </audio>
            {data.title && (
              <p className="text-sm mt-2 font-medium" style={{ color: 'var(--linktree-text-primary)' }}>
                {data.title}
              </p>
            )}
            {data.description && (
              <p className="text-xs mt-1" style={{ color: 'var(--linktree-text-secondary)' }}>
                {data.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
