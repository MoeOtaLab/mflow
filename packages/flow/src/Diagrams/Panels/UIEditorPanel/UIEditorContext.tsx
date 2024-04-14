import { ITreeNode } from '@designable/core';
import { useState } from 'react';
import { createContext, useContext } from 'use-context-selector';
import { defaultData } from './defaultData';

export type IUIEditorContextState = {
  currentTreeData?: ITreeNode;
  setCurrentTreeData: React.Dispatch<
    React.SetStateAction<IUIEditorContextState['currentTreeData']>
  >;
};

export const UIEditorContext = createContext<IUIEditorContextState>({
  currentTreeData: undefined,
  setCurrentTreeData: () => {}
});

export function UIEditorContextProvider(
  props: React.PropsWithChildren<{
    // noop
  }>
) {
  const { children } = props;
  const [currentTreeData, setCurrentTreeData] = useState<ITreeNode | undefined>(
    defaultData
  );

  return (
    <UIEditorContext.Provider
      value={{
        currentTreeData,
        setCurrentTreeData
      }}
    >
      {children}
    </UIEditorContext.Provider>
  );
}

export function useUIEditorContext() {
  return useContext(UIEditorContext);
}
