import { useRef } from 'react';
import type { ComponentData } from '../../types';

interface AvatarComponentProps {
  data: ComponentData;
  onUpdate: (data: Partial<ComponentData>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export default function AvatarComponent({
  data,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: AvatarComponentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate({ avatar: event.target?.result as string });
      };
      reader.readAsDataURL(file);
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

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <img
            src={data.avatar || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Ccircle cx="48" cy="48" r="48" fill="%23e5e7eb"/%3E%3Ctext x="48" y="60" text-anchor="middle" fill="%23666" font-family="Arial" font-size="24"%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E'}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-2 object-cover cursor-pointer hover:border-gray-400 transition"
            style={{ borderColor: 'var(--linktree-outline)' }}
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            className="absolute bottom-0 right-0 rounded-full p-1.5 cursor-pointer hover:bg-gray-700 transition shadow-md"
            style={{ backgroundColor: 'var(--linktree-secondary)' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fas fa-camera text-white text-xs"></i>
          </div>
        </div>
        <div className="flex-1 w-full">
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ name: e.currentTarget.innerHTML })}
            className="text-xl font-semibold focus:outline-none w-full mb-1 text-center"
            style={{ color: 'var(--linktree-text-primary)' }}
            dangerouslySetInnerHTML={{ __html: data.name || '' }}
            placeholder="Il tuo nome"
          />
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ description: e.currentTarget.innerHTML })}
            className="text-sm focus:outline-none w-full text-center"
            style={{ color: 'var(--linktree-text-secondary)' }}
            dangerouslySetInnerHTML={{ __html: data.description || '' }}
            placeholder="Breve descrizione"
          />
        </div>
      </div>
    </div>
  );
}

