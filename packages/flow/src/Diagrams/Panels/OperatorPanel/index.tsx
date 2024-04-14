import React, { type DragEventHandler } from 'react';
import { useOperators } from '../../State/OperatorProvider';
import { CustomOperator } from '../../Operators/CustomOperator';
import { registerOperators } from '../../Operators';
import css from './OperatorPanel.module.less';
import { FileChangeEnum, FileManager } from '../../components/FileManager';
import {
  getOperatorFromOperatorType,
  removeOperators
} from '../../Operators/OperatorMap';
import { Modal, message } from 'antd';

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
        getNewFile={() => {
          return {};
        }}
        onFileChange={(file, type) => {
          if (type === FileChangeEnum.Add) {
            const customOperator = new CustomOperator(file.title);
            registerOperators([customOperator]);
            refreshOperators();
            return {
              ...file,
              key: customOperator.operatorType,
              isLeaf: true
            };
          }

          if (type === FileChangeEnum.Delete) {
            const operator = getOperatorFromOperatorType(file.key);
            if (!operator?.isCustom) {
              message.warning(`can not delete default operator: ${file.title}`);
              return;
            }

            Modal.confirm({
              title: ` Are you sure you want to delete ${file.title}`,
              onOk() {
                removeOperators(file.key);
                refreshOperators();
              }
            });
          }

          return undefined;
        }}
      />
    </div>
  );
};
