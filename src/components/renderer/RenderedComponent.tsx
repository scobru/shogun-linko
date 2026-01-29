import { useEffect, useRef } from 'react';
import type { ComponentData } from '../../types';
import { makeLinksClickable } from '../../utils/makeLinksClickable';

interface RenderedComponentProps {
  component: ComponentData;
}

export default function RenderedComponent({ component }: RenderedComponentProps) {
  const codeRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const avatarNameRef = useRef<HTMLDivElement>(null);
  const avatarDescRef = useRef<HTMLDivElement>(null);

  // Apply makeLinksClickable to text components
  useEffect(() => {
    if (component.type === 'h1' && h1Ref.current) {
      makeLinksClickable(h1Ref.current);
    } else if (component.type === 'p' && pRef.current) {
      makeLinksClickable(pRef.current);
    } else if (component.type === 'avatar') {
      if (avatarNameRef.current) makeLinksClickable(avatarNameRef.current);
      if (avatarDescRef.current) makeLinksClickable(avatarDescRef.current);
    }
  }, [component]);

  useEffect(() => {
    if (component.type === 'code' && codeRef.current) {
      const html = component.html || '';
      const css = component.css || '';
      let js = component.js || '';

      js = js.replace(/`/g, '\\`');

      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '300px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      iframe.style.margin = '10px 0';

      iframe.onload = function () {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDoc) return;

          iframeDoc.open();
          iframeDoc.write('<!DOCTYPE html>');
          iframeDoc.write('<html><head><style>');
          iframeDoc.write('body { margin: 0; padding: 20px; font-family: "Inter", sans-serif; background: transparent; }');
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
      codeRef.current.innerHTML = '';
      codeRef.current.appendChild(iframe);
    }
  }, [component]);

  switch (component.type) {
    case 'h1':
      return (
        <h1
          ref={h1Ref}
          className={`text-2xl font-semibold mb-4 text-${component.alignment || 'center'}`}
          style={{ color: 'var(--linktree-text-primary)' }}
          dangerouslySetInnerHTML={{ __html: component.content || '' }}
        />
      );

    case 'p':
      return (
        <p
          ref={pRef}
          className={`text-base mb-4 text-${component.alignment || 'justify'}`}
          style={{ color: 'var(--linktree-text-secondary)' }}
          dangerouslySetInnerHTML={{ __html: component.content || '' }}
        />
      );

    case 'img':
      return component.src ? (
        <img
          src={component.src}
          alt="Immagine"
          className="max-w-full h-auto rounded-xl shadow-sm mx-auto mb-4"
        />
      ) : null;

    case 'avatar':
      return (
        <div className="text-center mb-6">
          {component.avatar && (
            <img
              src={component.avatar}
              alt="Avatar"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 mx-auto mb-4 object-cover shadow-xl transition-transform hover:scale-105"
              style={{ borderColor: 'var(--linktree-surface)' }}
            />
          )}
          {component.name && (
            <div
              ref={avatarNameRef}
              className="text-xl font-semibold mb-1"
              style={{ color: 'var(--linktree-text-primary)' }}
              dangerouslySetInnerHTML={{ __html: component.name }}
            />
          )}
          {component.description && (
            <div
              ref={avatarDescRef}
              className="text-sm"
              style={{ color: 'var(--linktree-text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: component.description }}
            />
          )}
        </div>
      );

    case 'link':
      return (
        <a
          href={component.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full max-w-2xl mx-auto rounded-full p-4 mb-4 hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] no-underline group"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            border: '1px solid var(--linktree-outline)',
          }}
        >
          <div className="flex items-center justify-center relative">
            <span className="font-semibold text-center w-full px-2 truncate" style={{ color: 'var(--linktree-text-primary)' }}>
              {component.title || 'Link'}
            </span>
            {/* Optional: Add icon back if needed, but centering links usually looks cleaner without right-aligned icons unless specified. 
                If we want an icon, it can be absolutely positioned or flexed. 
                For now, keeping it simple centered as per typical Linktree style. 
            */}
             <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className={component.icon || 'fas fa-external-link-alt'} style={{ color: 'var(--linktree-text-secondary)' }}></i>
             </div>
          </div>
        </a>
      );

    case 'spacer':
      return (
        <div
          className="my-4"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, var(--linktree-outline) 50%, transparent 100%)',
            height: '2px',
            borderRadius: '1px',
          }}
        />
      );

    case 'code':
      return <div ref={codeRef} className="code-component mb-4" />;

    case 'audio':
      return component.audioUrl ? (
        <div className="mb-4 text-center">
          <audio
            controls
            className="w-full max-w-md mx-auto rounded-lg shadow-sm"
            style={{ backgroundColor: 'var(--linktree-surface)' }}
          >
            <source src={component.audioUrl} type="audio/mpeg" />
            <source src={component.audioUrl} type="audio/wav" />
            <source src={component.audioUrl} type="audio/ogg" />
            Your browser does not support the audio element.
          </audio>
          {component.title && (
            <h3 className="text-lg font-semibold mt-2" style={{ color: 'var(--linktree-text-primary)' }}>
              {component.title}
            </h3>
          )}
          {component.description && (
            <p className="text-sm mt-1" style={{ color: 'var(--linktree-text-secondary)' }}>
              {component.description}
            </p>
          )}
        </div>
      ) : null;

    default:
      return null;
  }
}

