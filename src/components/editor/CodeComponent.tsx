import { useEffect, useRef } from 'react';
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
        <i className="fas fa-code mr-2 text-blue-600"></i>Componente Codice
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
          Template
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
          <option value="">Scegli un template...</option>
          <option value="myspace">MySpace Style Profile</option>
          <option value="geocities">GeoCities Blink Tag</option>
          <option value="marquee">Marquee Scrolling Text</option>
          <option value="guestbook">Guestbook Anni '90</option>
          <option value="hitcounter">Hit Counter</option>
          <option value="underconstruction">Under Construction</option>
          <option value="rainbow">Rainbow Text</option>
          <option value="matrix">Matrix Rain</option>
          <option value="custom">Codice Personalizzato</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
          HTML
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
          placeholder="Inserisci il tuo HTML qui..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
          CSS
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
          placeholder="Inserisci il tuo CSS qui..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
          JavaScript
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
          placeholder="Inserisci il tuo JavaScript qui..."
        />
      </div>

      <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
        <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--linktree-text-secondary)' }}>
          Anteprima:
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
            L'anteprima apparirà qui...
          </p>
        </div>
      </div>
    </div>
  );
}

