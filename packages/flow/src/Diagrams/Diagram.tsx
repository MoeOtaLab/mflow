import React, { useState } from 'react';
import { Radio } from 'antd';
import { DiagramsContextProvider } from './State/DiagramsProvider';
import { OperatorProvider } from './State/OperatorProvider';
import { LeftSidePanel } from './Panels/LeftSidePanel';
import { FlowDiagram } from './Panels/FlowDiagram';
import { AttributePanel } from './Panels/AttributePanel';
import { ConsolePanel } from './Panels/ConsolePanel';
import { UIEditorPanel } from './Panels/UIEditorPanel';
import css from './Diagram.module.less';

enum PanelEnum {
  Model = 'Model',
  UI = 'UI'
}

const url = new URL(window.location.href);

export const Diagram: React.FC = () => {
  const [currentPanel, setPanel] = useState(
    url.searchParams.get('panel') || PanelEnum.Model
  );

  return (
    <div>
      <div className={css['panel-selector-container']}>
        <Radio.Group
          value={currentPanel}
          onChange={(e) => {
            const newPanel = e.target.value;
            setPanel(newPanel);
            const url = new URL(window.location.href);
            url.searchParams.set('panel', newPanel);
            window.history.pushState('', '', url.href);
          }}
          defaultValue="Model"
          size="small"
        >
          <Radio.Button value={PanelEnum.Model}>Model</Radio.Button>
          <Radio.Button value={PanelEnum.UI}>UI</Radio.Button>
        </Radio.Group>
      </div>
      <OperatorProvider>
        <DiagramsContextProvider>
          {currentPanel === PanelEnum.Model && (
            <div key={currentPanel} className={css.container}>
              <LeftSidePanel />
              <FlowDiagram />
              <AttributePanel />
              <div className={css.console}>
                <ConsolePanel />
              </div>
            </div>
          )}
          {currentPanel === PanelEnum.UI && (
            <div key={currentPanel}>
              <UIEditorPanel />
            </div>
          )}
        </DiagramsContextProvider>
      </OperatorProvider>
    </div>
  );
};
