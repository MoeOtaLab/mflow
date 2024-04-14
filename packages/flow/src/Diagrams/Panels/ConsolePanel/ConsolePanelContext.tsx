import { createContext, useState, useContext } from 'react';
import { useDiagramsState } from '../../State/DiagramsProvider';
import { Layer } from '../../State/Layer';

export type IConsolePanelContextState = {
  output: string;
  setOutput: React.Dispatch<React.SetStateAction<string>>;

  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;

  cacheData: {
    layer: Layer;
  };
  setCacheData: React.Dispatch<
    React.SetStateAction<IConsolePanelContextState['cacheData']>
  >;
};

export const ConsolePanelContext = createContext<IConsolePanelContextState>({
  code: '',
  setCode: () => {},
  output: '',
  setOutput: () => {},
  cacheData: { layer: new Layer('') },
  setCacheData: () => {}
});

export function useConsolePanelContext() {
  return useContext(ConsolePanelContext);
}

export function ConsolePanelContextProvider(
  props: React.PropsWithChildren<{
    // noop
  }>
) {
  const { children } = props;
  const { layer } = useDiagramsState();
  const [output, setOutput] = useState('');
  const [code, setCode] = useState('');
  const [cacheData, setCacheData] = useState<{
    layer: Layer;
  }>({
    layer
  });

  return (
    <ConsolePanelContext.Provider
      value={{
        output,
        setOutput,
        code,
        setCode,
        cacheData,
        setCacheData
      }}
    >
      {children}
    </ConsolePanelContext.Provider>
  );
}
