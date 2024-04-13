import css from './FileManager.module.less';
import { useMemo } from 'react';
import {
  FileManagerContext,
  IFileManagerContext,
  ITreeDataNode,
  IHandledTreeDataNode
} from './FileManagerContext';
import { FileItem } from './FileItem';
import {
  AimOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  SwitcherOutlined
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useControllableValue } from 'ahooks';

type IFileManagerProps = {
  defaultTreeData?: ITreeDataNode[];
  treeData?: ITreeDataNode[];
  onTreeDataChange?: (treeData: ITreeDataNode[]) => void;
  defaultActiveKey?: IFileManagerContext['activeKey'];
  activeKey?: IFileManagerContext['activeKey'];
  onActiveKeyChange?: (activeKey: IFileManagerContext['activeKey']) => void;
  defaultExpandedKeys?: IFileManagerContext['expandedKeys'];
  expandedKeys?: IFileManagerContext['expandedKeys'];
  onExpandedKeysChange?: (
    expandedKey: IFileManagerContext['expandedKeys']
  ) => void;
  onDragStart?: IFileManagerContext['onDragStart'];
  onAddFile?: (activeTreeNode?: ITreeDataNode) => void;
};

function convertTreeData(
  treeData: ITreeDataNode,
  parentNode?: ITreeDataNode
): IHandledTreeDataNode {
  const currentNode = {
    ...treeData,
    parent: parentNode
  };

  currentNode.children = currentNode.children?.map((item) =>
    convertTreeData(item, currentNode)
  );

  return currentNode;
}

function findTargetTreeNode(
  treeData: IHandledTreeDataNode[],
  callback?: (item: IHandledTreeDataNode) => boolean
): IHandledTreeDataNode | undefined {
  for (const item of treeData) {
    if (callback?.(item)) {
      return item;
    }

    if (item.children?.length) {
      let targetNode = findTargetTreeNode(item.children, callback);
      if (targetNode) {
        return targetNode;
      }
    }
  }

  return undefined;
}

export function FileManager(props: IFileManagerProps) {
  const { onDragStart, onAddFile } = props;
  const [treeData] = useControllableValue<ITreeDataNode[]>(props, {
    defaultValue: [],
    defaultValuePropName: 'defaultTreeData',
    valuePropName: 'treeData',
    trigger: 'onTreeDataChange'
  });

  const [activeKey, setActiveKey] = useControllableValue<
    IFileManagerContext['activeKey']
  >(props, {
    defaultValue: undefined,
    defaultValuePropName: 'defaultActiveKey',
    valuePropName: 'activeKey',
    trigger: 'onActiveKeyChange'
  });

  const [expandedKeys, setExpandedKeys] = useControllableValue<
    IFileManagerContext['expandedKeys']
  >(props, {
    defaultValue: [],
    defaultValuePropName: 'defaultExpandedKeys',
    valuePropName: 'expandedKeys',
    trigger: 'onExpandedKeysChange'
  });

  const rootTreeData = useMemo(() => {
    return treeData?.map((item) => convertTreeData(item));
  }, [treeData]);

  const activeTreeNode = useMemo(() => {
    return findTargetTreeNode(
      rootTreeData,
      (treeNode) => treeNode.key === activeKey
    );
  }, [activeKey, rootTreeData]);

  const highlightKey = useMemo(() => {
    if (activeKey && expandedKeys.includes(activeKey)) {
      return activeKey;
    }

    return activeTreeNode?.parent?.key;
  }, [activeKey, activeTreeNode, expandedKeys]);

  return (
    <div>
      <div className={css['action-container']}>
        <Tooltip
          placement="bottom"
          arrow={false}
          title={'Add File'}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <div
            className={css['action-icon']}
            onClick={() => {
              activeTreeNode;

              onAddFile?.(
                activeTreeNode?.isLeaf ? activeTreeNode.parent : activeTreeNode
              );
            }}
          >
            <FileAddOutlined />
          </div>
        </Tooltip>
        <Tooltip
          placement="bottom"
          arrow={false}
          title={'Add Directory'}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <div className={css['action-icon']}>
            <FolderAddOutlined />
          </div>
        </Tooltip>
        <Tooltip
          placement="bottom"
          arrow={false}
          title={'Collapse All'}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <div
            className={css['action-icon']}
            onClick={() => {
              setExpandedKeys([]);
            }}
          >
            <SwitcherOutlined />
          </div>
        </Tooltip>
        <Tooltip
          placement="bottom"
          arrow={false}
          title={'Reveal Active File'}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <div
            className={css['action-icon']}
            onClick={() => {
              const activeNode = findTargetTreeNode(
                rootTreeData,
                (treeNode) => treeNode.key === activeKey
              );
              const appendKeys: IHandledTreeDataNode['key'][] = [];
              let currentNode = activeNode;
              while (currentNode) {
                appendKeys.push(currentNode.key);
                currentNode = currentNode.parent;
              }
              setExpandedKeys((keys) => {
                return [...new Set([...keys, ...appendKeys])];
              });
            }}
          >
            <AimOutlined />
          </div>
        </Tooltip>
      </div>
      <div className={css['file-tree-container']}>
        <FileManagerContext.Provider
          value={{
            expandedKeys,
            setExpandedKeys,
            activeKey,
            setActiveKey,
            rootTreeData,
            highlightKey,
            onDragStart
          }}
        >
          {rootTreeData?.map((item) => <FileItem indent={0} treeData={item} />)}
        </FileManagerContext.Provider>
      </div>
    </div>
  );
}
