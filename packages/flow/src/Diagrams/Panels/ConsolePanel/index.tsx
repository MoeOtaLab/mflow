import React, { useState } from 'react';
import { useDiagramsState } from '../../State/DiagramsProvider';
import { Complier, NodeGraph } from '../../Compiler';
import { LinkRuntimeContextProvider } from '../../Compiler/runtime';
import { Demo } from './Demo';
import { Button, Modal } from 'antd';
import { cloneDeep } from 'lodash';
import { type Layer } from '../../State/Layer';
import { Editor } from '../../components/Editor';
import css from './Editor.module.less';

export const ConsolePanel: React.FC = () => {
  const { layer } = useDiagramsState();
  const [output, setOutput] = useState('');
  const [code, setCode] = useState('');
  const [cacheData, setCacheData] = useState<{
    layer: Layer;
  }>({
    layer
  });

  const [outputVisible, setOutputVisible] = useState(false);

  return (
    <div>
      <div>Console</div>
      <br />
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridAutoFlow: 'column',
          justifyContent: 'start'
        }}
      >
        <Button
          type="link"
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
          type="link"
          onClick={() => {
            const complier = new Complier();
            setOutput(complier.complie({ layer }));
          }}
        >
          Compile
        </Button>

        <Button
          type="link"
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
          type="link"
          disabled={!output}
          onClick={() => {
            setOutputVisible(true);
          }}
        >
          Show Output
        </Button>
      </div>

      <div>
        <br />
        <LinkRuntimeContextProvider
          value={code}
          nodes={cacheData.layer.nodes}
          edges={cacheData.layer.edges}
        >
          <Demo />
        </LinkRuntimeContextProvider>
      </div>

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
