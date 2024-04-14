import React, { useEffect, useRef, useState } from 'react';
import { LinkRuntimeContextProvider } from '../../Compiler/runtime';
import { Demo } from './Demo';
import { useConsolePanelContext } from './ConsolePanelContext';
import css from './ConsolePanel.module.less';

export const ConsolePanel: React.FC = () => {
  const { code, cacheData } = useConsolePanelContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultHeight = 8;
  const [height, setHeight] = useState(defaultHeight);

  useEffect(() => {
    if (code) {
      setHeight(200);
    }
  }, [code]);

  return (
    <div>
      <div>Console</div>
      <div
        style={height === undefined ? {} : { height }}
        className={css['demo-container']}
        ref={containerRef}
      >
        <div
          className={css['resize-bar']}
          onMouseDown={(event) => {
            const initMouseOffset = event.clientY;
            const initialHeight =
              containerRef.current!.getBoundingClientRect().height;
            function handleMouseMove(event: MouseEvent) {
              const currentMouseY = event.clientY;
              const offset = initMouseOffset - currentMouseY;
              const targetHeight = offset + initialHeight;
              const throltte = 8;
              setHeight(
                Math.min(
                  window.innerHeight * 0.8,
                  Math.max(targetHeight, throltte)
                )
              );
              if (targetHeight < throltte) {
                setHeight(0);
              }
            }

            function handleMouseUp() {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            }

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        ></div>
        <br />
        <LinkRuntimeContextProvider
          value={code}
          nodes={cacheData.layer.nodes}
          edges={cacheData.layer.edges}
        >
          <Demo />
        </LinkRuntimeContextProvider>
      </div>
    </div>
  );
};
