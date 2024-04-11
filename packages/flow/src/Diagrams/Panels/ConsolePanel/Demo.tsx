import { Button, Form, Input, message } from 'antd';
import { type Node } from 'reactflow';
import { useLinkRuntimeContext } from '../../Compiler/runtime';
import { NodeGraph } from '../../Compiler';
import { getOperatorFromNode } from '../../Operators';
import { useEffect, useRef, useState } from 'react';
import { type IInputOperatorData, type IOutputOperatorData } from '../../Operators/types';
import { type OutputOperator } from '../../Operators/OutputOperator';
import { type InputOperator } from '../../Operators/InputOperator';
import { type ModelBlock, ModelState, Action } from '@eos/core';
import React from 'react';

export const Demo: React.FC = () => {
  const { store, nodes, edges } = useLinkRuntimeContext();

  const keyRef = useRef(1);
  const [instance, _setInstance] = useState<ModelBlock>();

  const setInstance: typeof _setInstance = (action) => {
    keyRef.current += 1;
    return _setInstance(action);
  };
  const inputStateMapRef = useRef<Record<string, ModelState<any>>>({});
  const nodeGraph = new NodeGraph(nodes, edges);

  const inputNode = nodes.find(
    (item): item is Node<IInputOperatorData> => getOperatorFromNode(item)?.operatorType === 'InputOperator'
  );
  const inputStatePorts = !inputNode
    ? []
    : getOperatorFromNode<InputOperator>(inputNode)?.getStatePort(inputNode);

  const inputEventPorts = !inputNode
    ? []
    : getOperatorFromNode<InputOperator>(inputNode)?.getEventPorts(inputNode);

  const outputNode = nodes.find(
    (item): item is Node<IOutputOperatorData> => getOperatorFromNode(item)?.operatorType === 'OutputOperator'
  );

  useEffect(() => {
    console.log('store ==> ', store);
    inputStateMapRef.current = Object.fromEntries(
      inputStatePorts?.map((item) => [item.variableName, new ModelState(undefined)]) || []
    );
    const result = store?.(inputStateMapRef.current);
    console.log('init ==> ', result);
    setInstance(result);
  }, [store]);

  useEffect(() => {
    if (!outputNode) {
      return;
    }

    const outputPorts = getOperatorFromNode<OutputOperator>(outputNode)?.getEventPorts(outputNode);

    outputPorts?.forEach((port) => {
      instance?.output[port.variableName || '']?.subscribe((action: any) => {
        message.info(`value: ${action.payload}`);
        console.log('events', port, action);
      });
    });
  }, [instance]);

  const [inputValue, setInputValue] = useState('');
  const [, forceUpdate] = useState([]);

  const outputValueIds = !outputNode
    ? []
    : getOperatorFromNode<OutputOperator>(outputNode)
        ?.getStatePort(outputNode)
        .map((item) => {
          const handleId = nodeGraph
            .findSourceNodes(outputNode.id)
            ?.find((con) => con.handleId === item.id)?.relatedHandleId;
          return {
            port: item,
            handleId
          };
        });

  useEffect(() => {
    outputValueIds
      ?.map(({ port }) => {
        return instance?.output?.[port.variableName || ''];
      })
      .forEach((value) => {
        value?.subscribe((action: any) => {
          console.log(action);
          forceUpdate([]);
        });
      });
  }, [instance]);

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridAutoFlow: 'column',
        justifyContent: 'start',
        marginBottom: 16
      }}
    >
      {instance?.output && (
        <React.Fragment key={keyRef.current}>
          <div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                {inputStatePorts?.map((item) => (
                  <div key={item.id}>
                    {item.label || item.variableName}:
                    <Input
                      onChange={(e) => {
                        const value: string = e.target.value;
                        console.log('instance', instance);
                        inputStateMapRef.current?.[item.variableName || '']?.next(
                          new Action({
                            payload: value,
                            path: item.variableName || ''
                          })
                        );
                      }}
                    />
                  </div>
                ))}
                <div>
                  Event Value:
                  <Input
                    value={inputValue}
                    onChange={(event) => {
                      setInputValue(event.target.value);
                    }}
                    size="small"
                    placeholder="发送事件的参数（请填写 JSON）"
                  />
                </div>
                {inputEventPorts?.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => {
                      instance?.output?.[item.variableName || '']?.next(
                        new Action({
                          payload: JSON.parse(inputValue),
                          path: item.variableName || ''
                        })
                      );
                    }}
                  >
                    {item.label || item.variableName}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div>Output</div>
            {outputValueIds?.map(({ port }) => {
              return (
                <div key={port.id}>
                  <Form.Item label={port.label || port.variableName}>
                    {JSON.stringify(instance?.output?.[port.variableName || '']?.current)}
                  </Form.Item>
                </div>
              );
            })}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};
