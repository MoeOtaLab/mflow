import React, { useRef, type DragEventHandler, useCallback } from 'react';
import Dagre from '@dagrejs/dagre';
import { Button, message } from 'antd';
import ReactFlow, {
  addEdge,
  type ReactFlowProps,
  useStore,
  isEdge,
  type Node,
  applyNodeChanges,
  applyEdgeChanges,
  type Edge,
  // plugins
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  Panel
} from 'reactflow';
import { OPERATOR_TYPE_DATA } from '../OperatorPanel';
import {
  getOperatorFromNode,
  getOperatorFromOperatorType
} from '../../Operators';
import {
  useDiagramsContext,
  useDiagramsHookOption
} from '../../State/DiagramsProvider';
import { nodeTypes } from '../../Nodes';
import { isSameSourceHandle, isSameTargetHandle } from '../../utils';
import css from './FlowDiagram.module.less';
import { LayerIndicator } from '../LayerPanel/LayerIndicator';

const nodeColor = (node: Node) => {
  const operator = getOperatorFromNode(node);
  if (operator?.nodeColor) {
    return operator?.nodeColor;
  }
  return '#ff0072';
};
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR' });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.width || undefined,
      height: node.height || undefined
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id);

      return { ...node, position: { x, y } };
    }),
    edges
  };
};

export const FlowDiagram: React.FC = () => {
  const { nodes, edges, setNodes, setEdges, layer } = useDiagramsContext();
  const { actionsRef, currentStateRef } = useDiagramsHookOption();

  const addSelectedEdges = useStore((ctx) => ctx.addSelectedEdges);

  const onConnect: ReactFlowProps['onConnect'] = (connection) => {
    console.log('connection', connection);
    setEdges((eds) =>
      addEdge(connection, eds).filter((item) => {
        if (isEdge(item)) {
          if (
            !isSameSourceHandle(item, connection) &&
            isSameTargetHandle(item, connection)
          ) {
            return false;
          }
        }
        return true;
      })
    );

    setTimeout(() => {
      const targetEdge = edges.find((el) => {
        const edge = connection;
        return (
          isEdge(el) &&
          el.source === edge.source &&
          el.target === edge.target &&
          (el.sourceHandle === edge.sourceHandle ||
            (!el.sourceHandle && !edge.sourceHandle)) &&
          (el.targetHandle === edge.targetHandle ||
            (!el.targetHandle && !edge.targetHandle))
        );
      });
      addSelectedEdges(
        [targetEdge]
          .filter((item): item is Edge => Boolean(item))
          .map((item) => item.id)
      );
    });
  };

  const dropTarget = useRef<HTMLDivElement>(null);

  const updateNodePos = useStore((ctx) => ctx.updateNodePositions);
  const nodesRef = useRef<Node[]>([]);
  useStore((ctx) => {
    nodesRef.current = ctx.getNodes();
    return nodesRef;
  });

  const handleDrop: DragEventHandler = (event) => {
    const operatorType = event.dataTransfer.getData(OPERATOR_TYPE_DATA);
    if (layer.relativeOperatorType === operatorType) {
      message.warning(
        'use operation itself in operator, be careful for looping'
      );
    }
    if (operatorType) {
      const operator = getOperatorFromOperatorType(operatorType);
      if (operator) {
        const operatorInstance = operator.create();
        if (operator.isUnique) {
          if (
            nodes.find(
              (item: typeof operatorInstance) =>
                item.data?.operatorType === operator.operatorType
            )
          ) {
            message.warning(`只允许存在一个${operator.operatorName}`);
            return;
          }
        }
        const { clientX, clientY } = event;
        const rect = dropTarget.current?.getBoundingClientRect();
        if (rect) {
          operatorInstance.position = {
            x: clientX - rect.left,
            y: clientY - rect.y
          };
        }

        setNodes((eles) => [...eles, operatorInstance]);
        setTimeout(() => {
          const node = nodesRef.current.find(
            (item) => item.id === operatorInstance.id
          );

          if (node) {
            const pos = {
              x: node?.position?.x - (node?.width || 0) / 2,
              y: node.position.y - Math.max((node?.height || 0) / 5, 30)
            };

            node.position = pos;
            // TODO: zoom
            updateNodePos([node], false, false);
          }

          setNodes((eles) => {
            const target = eles.find((item) => item.id === operatorInstance.id);
            if (target) {
              operatorInstance.style = {
                visibility: 'visible'
              };
            }
            return [...eles];
          });

          operator?.onAfterCreate?.({
            node: node as typeof operatorInstance,
            currentState: currentStateRef.current,
            actions: actionsRef.current
          });
        });
      }
    }
  };

  const handleDragOver: DragEventHandler = (event) => {
    if (event.dataTransfer.types.includes(OPERATOR_TYPE_DATA)) {
      event.preventDefault();
    }
  };

  const onNodesChange = useCallback((changes) => {
    setNodes((ns) => applyNodeChanges(changes, ns));
  }, []);
  const onEdgesChange = useCallback((changes) => {
    setEdges((es) => applyEdgeChanges(changes, es));
  }, []);

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);

    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  }, [nodes, edges]);

  return (
    <div
      className={css['main-flow']}
      ref={dropTarget}
      onDrop={handleDrop}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
    >
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        zoomOnScroll={false}
        defaultEdgeOptions={{ animated: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          color="rgba(255,255,255,0.4)"
          size={2}
        />
        <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
        <Controls />
        <Panel position="top-left">
          <LayerIndicator />
        </Panel>
        <Panel position="top-right">
          <Button
            type="text"
            style={{ color: 'white' }}
            onClick={() => {
              onLayout();
            }}
          >
            layout
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
