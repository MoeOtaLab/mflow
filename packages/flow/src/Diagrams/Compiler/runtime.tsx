import { type Edge, type Node } from 'reactflow';
import React, { useState, useMemo, useEffect, useContext } from 'react';
import * as EosCore from '@eos/core';
import * as EosOperators from '@eos/core/operators';

export const EosCoreSymbol = 'EosCore';
export const EosOperatorsSymbol = 'EosOperators';

export interface RuntimeContextState {
  store?: (input: EosCore.InputOutputInterface) => EosCore.ModelBlock;
  nodes: Node[];
  edges: Edge[];
}

export const RuntimeContext = React.createContext<RuntimeContextState>({
  store: undefined,
  nodes: [],
  edges: []
});

export function useLinkRuntimeContext() {
  return useContext(RuntimeContext);
}

export function runCode(code: string) {
  const moduleData = { exports: undefined };
  // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
  const runLinkLogic = new Function(
    'module',
    EosCoreSymbol,
    EosOperatorsSymbol,
    code
  );
  runLinkLogic(moduleData, EosCore, EosOperators);
  return moduleData;
}

interface LinkRuntimeContextProviderProps {
  value: string;
  nodes: Node[];
  edges: Edge[];
}

export const LinkRuntimeContextProvider: React.FC<
  LinkRuntimeContextProviderProps
> = (props) => {
  const { value, children, nodes, edges } = props;
  const [store, setStore] = useState<RuntimeContextState['store']>();

  const contextValue = useMemo(
    () => ({
      store,
      nodes,
      edges
    }),
    [store, nodes, edges]
  );

  useEffect(() => {
    if (!value) {
      setStore(undefined);
      return;
    }

    const result = runCode(value);
    console.log({
      result,
      value
    });
    if (result) {
      setStore(() => result.exports);
    }
  }, [value]);

  return (
    <RuntimeContext.Provider value={contextValue}>
      {children}
    </RuntimeContext.Provider>
  );
};
