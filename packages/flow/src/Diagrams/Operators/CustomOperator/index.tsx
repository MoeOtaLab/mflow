import { type Node } from 'reactflow';
import { type IGenerationOption } from '../../Compiler';
import { NodeTypeEnum } from '../../Nodes/NodeTypeEnum';
import { Layer } from '../../State/Layer';
import { MetaOperator } from '../MetaOperator';
import {
  type IHookOption,
  type ICustomOperatorData,
  type IAppContainersInfo
} from '../types';
import { v4 as uuid } from 'uuid';
import {
  getNodeEndPointFromLayer,
  getInputPorts,
  getOutputPorts
} from '../GroupOperator/utils';
import { getRandomId } from '../../utils';
import { EosCoreSymbol } from '../../Compiler/runtime';

export class CustomOperator
  extends MetaOperator<ICustomOperatorData>
  implements MetaOperator<ICustomOperatorData>
{
  description: string = '双击编辑';
  nodeColor?: string | undefined = '#DF826C';
  isCustom?: boolean | undefined = true;

  content: IAppContainersInfo['data'];

  getOperatorId() {
    return `custom_operator_${this.content.layer.id}`;
  }

  constructor(operatorName: string) {
    super({
      operatorName,
      operatorType: `Custom_${uuid()}`,
      nodeType: NodeTypeEnum.Node
    });

    this.content = {
      layer: new Layer(operatorName)
    };

    this.content.layer.relativeOperatorType = this.operatorType;
  }

  updateContent(content: { layer: Layer }) {
    this.content = content;
  }

  replaceContent(content: { layer: Layer }) {
    this.content = content;
    this.content.layer.relativeOperatorType = this.operatorType;
    this.content.layer.name = this.operatorName;
  }

  create(): Node<ICustomOperatorData<Record<string, any>>> {
    const id = getRandomId();
    const { endPointList } = getNodeEndPointFromLayer(this.content.layer, id);

    const node = super.create(
      {
        endPointOptions: {
          endPointList
        }
      },
      { id }
    );

    return node;
  }

  generateBlockDeclarations(
    options: IGenerationOption<ICustomOperatorData>
  ): string[] {
    const { node, nodeGraph, formatVariableName, formatBlockVarName } = options;

    return [
      `const temp_${formatVariableName(
        node.id
      )} = context.mount(${formatBlockVarName(this.getOperatorId())}, {
        ${getInputPorts(node)
          .map((port) => {
            const sourceId = nodeGraph
              .findSourceNodes(node.id)
              ?.find((item) => item.handleId === port.id)?.relatedHandleId;

            if (!sourceId) {
              return '';
            }

            return `['${port.variableName}']: ${formatVariableName(
              sourceId || ''
            )}`;
          })
          .filter(Boolean)
          .join(',\n')}
      })`,
      ...(getOutputPorts(node) || [])?.map((port) => {
        return `const ${formatVariableName(
          port.id
        )} = new ${EosCoreSymbol}.ModelProxy()`;
      })
    ];
  }

  generateBlockOutput(
    options: IGenerationOption<ICustomOperatorData<Record<string, any>>>
  ): string[] {
    return [];
  }

  generateBlockRelation(
    options: IGenerationOption<ICustomOperatorData<Record<string, any>>>
  ): string[] {
    const { node, formatVariableName } = options;
    return [
      `temp_${formatVariableName(node.id)}.on('postInit', () => {
        ${[
          ...(getOutputPorts(node) || [])?.map((port) => {
            return `${formatVariableName(
              port.id
            )}.proxy(temp_${formatVariableName(node.id)}.output['${
              port.variableName
            }'])`;
          })
        ].join('\n')}
      })`
    ];
  }

  getExtraAppContainers(): IAppContainersInfo[] {
    return [
      {
        appContainerId: this.getOperatorId(),
        data: this.content
      }
    ];
  }

  onNodeDoubleClick(option: IHookOption<Node<ICustomOperatorData>>): void {
    const { actions, currentState } = option;
    if (currentState.defaultLayer.id === currentState.layer.id) {
      actions.setDefaultLayer(currentState.layer);
    }

    actions.setLayer(this.content.layer);
    actions.setActiveLayerId(this.content.layer.id);
  }

  refreshNode(options: IHookOption<Node<ICustomOperatorData>>) {
    const { node, currentState } = options;

    const { endPointList } = getNodeEndPointFromLayer(
      this.content.layer,
      node.id
    );

    if (endPointList) {
      options.actions.updateNode(
        node.id,
        (v) => this.updateData(v, { endPointOptions: { endPointList } }),
        {
          updateInternal: true,
          layerId: currentState.layer?.id
        }
      );
    }
  }

  onLayerChange(
    options: Omit<
      IHookOption<Node<ICustomOperatorData<Record<string, any>>>>,
      'node'
    >
  ): void {
    const { currentState } = options;
    const currentNodes = currentState.layer.nodes?.filter(
      (item: Node<ICustomOperatorData>) =>
        item.data?.operatorType === this.operatorType
    );

    currentNodes?.forEach((node) => {
      this.refreshNode({
        node,
        ...options
      });
    });
  }

  onNodeFocus(options: IHookOption<Node<ICustomOperatorData>>): void {
    this?.refreshNode(options);
  }
}
