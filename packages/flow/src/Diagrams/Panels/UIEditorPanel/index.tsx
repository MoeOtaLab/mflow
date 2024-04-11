import { useRef } from 'react';

export function UIEditorPanel() {
  const divRef = useRef<HTMLDivElement>(null);

  return <div ref={divRef}></div>;
}
