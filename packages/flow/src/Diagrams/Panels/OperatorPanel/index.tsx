import React, { type DragEventHandler } from 'react';
import { useOperators } from '../../State/OperatorProvider';
import { CustomOperator } from '../../Operators/CustomOperator';
import { registerOperators } from '../../Operators';
import css from './OperatorPanel.module.less';
import { Input, type InputRef, Modal, message } from 'antd';
import { FileManager } from '../../components/FileManager';

export const OPERATOR_TYPE_DATA = 'operator_type';

type DragEventGenerator = (key: string, value: string) => DragEventHandler;

export const OperatorPanel: React.FC = () => {
  const handleDragStart: DragEventGenerator = (key, value) => (event) => {
    event.dataTransfer.setData(key, value);
    event.dataTransfer.dropEffect = 'copy';
    event.dataTransfer.effectAllowed = 'all';
  };

  const { operators, refreshOperators } = useOperators();
  const defaultOperators = operators.filter((item) => !item.isCustom);
  const customOperators = operators.filter((item) => item.isCustom);

  return (
    <div className={css.container}>
      <FileManager
        onDragStart={(event, treeData) => {
          console.log('handleDragStart', { treeData });
          handleDragStart(
            OPERATOR_TYPE_DATA,
            String(treeData?.key || '')
          )(event);
        }}
        treeData={[
          {
            title: 'Default',
            key: 'Default',
            children: defaultOperators.map((item) => ({
              title: item.operatorName,
              key: item.operatorType,
              isLeaf: true
            }))
          },
          {
            title: 'Custom',
            key: 'Custom',
            children: customOperators.map((item) => ({
              title: item.operatorName,
              key: item.operatorType,
              isLeaf: true
            }))
          }
        ]}
        onAddFile={() => {
          let name = '';
          function addCustomOperator() {
            if (!name) {
              message.warning('Please input name');
              return;
            }

            const customOperator = new CustomOperator(name);
            registerOperators([customOperator]);
            refreshOperators();
          }
          let inputRef: InputRef | undefined | null;
          const instance = Modal.info({
            title: 'Custom Operator Name',
            content: (
              <div>
                <Input
                  ref={(ref) => {
                    inputRef = ref;
                  }}
                  onChange={(e) => {
                    name = e.target.value || '';
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      instance.destroy();
                      addCustomOperator();
                    }
                  }}
                />
              </div>
            ),
            onOk() {
              addCustomOperator();
            }
          });

          setTimeout(() => {
            console.log('inputRef', inputRef);
            inputRef?.input?.focus();
          }, 200);
        }}
      />
    </div>
  );
};
