import { type NodeProps } from 'reactflow';
import { BaseNode } from '../components/BaseNode';
import { type IStateNodeData, StateNodeValueTypeEnum } from '../types';
import css from './StateNode.module.less';
import { message } from 'antd';

export function StateNode(props: NodeProps<IStateNodeData>) {
  const {
    data: { value, valueType },
  } = props;

  return (
    <BaseNode
      title={
        <div
          className={css['value-container']}
          onClick={() => {
            if (valueType === StateNodeValueTypeEnum.Object) {
              message.info(value);
            }
          }}
        >
          {valueType === StateNodeValueTypeEnum.Object
            ? 'Object(click to view)'
            : JSON.stringify(value)}
        </div>
      }
      {...props}
      className={css['state-node__container']}
    />
  );
}