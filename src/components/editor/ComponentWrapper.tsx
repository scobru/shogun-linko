import { ComponentData } from '../../types';
import H1Component from './H1Component';
import ParagraphComponent from './ParagraphComponent';
import ImageComponent from './ImageComponent';
import LinkComponent from './LinkComponent';
import AvatarComponent from './AvatarComponent';
import SpacerComponent from './SpacerComponent';
import CodeComponent from './CodeComponent';
import AudioComponent from './AudioComponent';

interface ComponentWrapperProps {
  component: ComponentData;
  onUpdate: (id: string, updates: Partial<ComponentData>) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function ComponentWrapper({
  component,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ComponentWrapperProps) {
  const handleUpdate = (updates: Partial<ComponentData>) => {
    onUpdate(component.id, updates);
  };

  const handleMoveUp = () => onMoveUp(component.id);
  const handleMoveDown = () => onMoveDown(component.id);
  const handleRemove = () => onRemove(component.id);

  const commonProps = {
    data: component,
    onUpdate: handleUpdate,
    onMoveUp: handleMoveUp,
    onMoveDown: handleMoveDown,
    onRemove: handleRemove,
  };

  switch (component.type) {
    case 'h1':
      return <H1Component {...commonProps} />;
    case 'p':
      return <ParagraphComponent {...commonProps} />;
    case 'img':
      return <ImageComponent {...commonProps} />;
    case 'link':
      return <LinkComponent {...commonProps} />;
    case 'avatar':
      return <AvatarComponent {...commonProps} />;
    case 'spacer':
      return <SpacerComponent {...commonProps} />;
    case 'code':
      return <CodeComponent {...commonProps} />;
    case 'audio':
      return <AudioComponent {...commonProps} />;
    default:
      return null;
  }
}

