import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ComponentData } from '../../types';
import { codeTemplates } from '../../utils/codeTemplates';

interface CodeComponentProps {
  data: ComponentData;
  onUpdate: (data: Partial<ComponentData>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export default function CodeComponent({
  data,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CodeComponentProps) {
  const { t } = useTranslation();
  const previewRef = useRef<HTMLDivElement>(null);

  const updatePreview = () => {
    if (!previewRef.current) return;

    const html = data.html || '';
    const css = data.css || '';
    let js = data.js || '';

    js = js.replace(/`/g, '\\`');

    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '200px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';

    iframe.onload = function () {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        iframeDoc.open();
        iframeDoc.write('<!DOCTYPE html>');
        iframeDoc.write('<html><head><style>');
        iframeDoc.write('body { margin: 0; padding: 15px; font-family: "Inter", sans-serif; }');
        iframeDoc.write(css);
        iframeDoc.write('</style></head><body>');
        iframeDoc.write(html);
        iframeDoc.write('</body></html>');
        iframeDoc.close();

        if (js && js.trim()) {
          const script = iframeDoc.createElement('script');
          script.textContent = `try { ${js} } catch(e) { console.error("JS Error:", e); }`;
          iframeDoc.body.appendChild(script);
        }
      } catch (error) {
        console.error('Error setting up iframe:', error);
      }
    };

    iframe.src = 'about:blank';
    previewRef.current.innerHTML = '';
    previewRef.current.appendChild(iframe);
  };

  useEffect(() => {
    const timer = setTimeout(updatePreview, 100);
    return () => clearTimeout(timer);
  }, [data.html, data.css, data.js]);

  const handleTemplateChange = (templateName: string) => {
    if (templateName && codeTemplates[templateName]) {
      const template = codeTemplates[templateName];
      onUpdate({
        template: templateName,
        html: template.html,
        css: template.css,
        js: template.js,
      });
    }
  };

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
        <i className="fas fa-code mr-2 text-blue-600"></i>{t('components.code.title')}
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
          {t('components.code.template')}
        </label>
        <select
          value={data.template || ''}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            color: 'var(--linktree-text-primary)',
            borderColor: 'var(--linktree-outline)',
          }}
        >
          <option value="">{t('components.code.chooseTemplate')}</option>
          <option value="myspace">{t('components.code.templates.myspace')}</option>
          <option value="geocities">{t('components.code.templates.geocities')}</option>
          <option value="marquee">{t('components.code.templates.marquee')}</option>
          <option value="guestbook">{t('components.code.templates.guestbook')}</option>
          <option value="hitcounter">{t('components.code.templates.hitcounter')}</option>
          <option value="underconstruction">{t('components.code.templates.underconstruction')}</option>
          <option value="rainbow">{t('components.code.templates.rainbow')}</option>
          <option value="matrix">{t('components.code.templates.matrix')}</option>
          <option value="custom">{t('components.code.templates.custom')}</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
          {t('components.code.html')}
        </label>
        <textarea
          value={data.html || ''}
          onChange={(e) => onUpdate({ html: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            color: 'var(--linktree-text-primary)',
            borderColor: 'var(--linktree-outline)',
          }}
          rows={4}
          placeholder={t('components.code.htmlPlaceholder')}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
          {t('components.code.css')}
        </label>
        <textarea
          value={data.css || ''}
          onChange={(e) => onUpdate({ css: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            color: 'var(--linktree-text-primary)',
            borderColor: 'var(--linktree-outline)',
          }}
          rows={4}
          placeholder={t('components.code.cssPlaceholder')}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
          {t('components.code.js')}
        </label>
        <textarea
          value={data.js || ''}
          onChange={(e) => onUpdate({ js: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            color: 'var(--linktree-text-primary)',
            borderColor: 'var(--linktree-outline)',
          }}
          rows={4}
          placeholder={t('components.code.jsPlaceholder')}
        />
      </div>

      <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
        <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
          {t('components.code.preview')}
        </h4>
        <div
          ref={previewRef}
          className="border rounded p-3 min-h-[100px]"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            borderColor: 'var(--linktree-outline)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>
            {t('components.code.previewPlaceholder')}
          </p>
        </div>
      </div>
    </div>
  );
}

