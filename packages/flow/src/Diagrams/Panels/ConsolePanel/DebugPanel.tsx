import React, { useState } from 'react';
import { useDiagramsState } from '../../State/DiagramsProvider';
import { Complier, NodeGraph } from '../../Compiler';
import { Button, Modal } from 'antd';
import { cloneDeep } from 'lodash';
import { useConsolePanelContext } from './ConsolePanelContext';
import { Editor } from '../../components/Editor';
import css from './Editor.module.less';

export const DebugPanel: React.FC = () => {
  const { layer } = useDiagramsState();
  const [outputVisible, setOutputVisible] = useState(false);
  const { output, setOutput, setCacheData, setCode } = useConsolePanelContext();

  return (
    <div style={{ display: 'grid', gridAutoFlow: 'row', gap: 4 }}>
      <Button
        type="text"
        onClick={() => {
          console.log(new NodeGraph(layer.nodes, layer.edges));
          console.log({
            layer
          });
        }}
      >
        Console Graph
      </Button>

      <Button
        type="text"
        onClick={() => {
          const complier = new Complier();
          setOutput(complier.complie({ layer }));
        }}
      >
        Compile
      </Button>

      <Button
        type="text"
        onClick={() => {
          const complier = new Complier();
          const code = complier.complie({ layer });
          setCacheData(cloneDeep({ layer }));
          setOutput(code);
          setCode(code);
        }}
      >
        Compile and Run
      </Button>

      <Button
        type="text"
        disabled={!output}
        onClick={() => {
          setOutputVisible(true);
        }}
      >
        Show Output
      </Button>
      <Modal
        open={outputVisible}
        width={'100vw'}
        style={{ top: 0 }}
        onOk={() => {
          setOutputVisible(false);
        }}
        onCancel={() => {
          setOutputVisible(false);
        }}
      >
        <Editor
          language="typescript"
          readonly={true}
          className={css.editor}
          code={output}
        />
      </Modal>
    </div>
  );
};
