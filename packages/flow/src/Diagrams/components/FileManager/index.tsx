import css from './FileManager.module.less';
import classnames from 'classnames';
import { useEffect, useMemo, useRef } from 'react';
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
import { useControllableValue, useLatest } from 'ahooks';

type IFileManagerProps = {
  defaultTreeData?: ITreeDataNode[];
  treeData?: ITreeDataNode[];
  onTreeDataChange?: (treeData: ITreeDataNode[]) => void;
  defaultActiveKey?: IFileManagerContext['activeKey'];
  activeKey?: IFileManagerContext['activeKey'];
  onActiveKeyChange?: (activeKey: IFileManagerContext['activeKey']) => void;
  focusKey?: IFileManagerContext['focusKey'];
  onFocusKeyChange?: (focusKey: IFileManagerContext['focusKey']) => void;
  defaultExpandedKeys?: IFileManagerContext['expandedKeys'];
  expandedKeys?: IFileManagerContext['expandedKeys'];
  onExpandedKeysChange?: (
    expandedKey: IFileManagerContext['expandedKeys']
  ) => void;
  onDragStart?: IFileManagerContext['onDragStart'];
  onAddFile?: (activeTreeNode?: ITreeDataNode) => void;
};

const ROOT_FOCUS_KEY = '__ROOT_FOCUS_KEY__';

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

  const [focusKey, setFocusKey] = useControllableValue<
    IFileManagerContext['focusKey']
  >(props, {
    defaultValue: undefined,
    defaultValuePropName: 'defaultFocusKey',
    valuePropName: 'focusKey',
    trigger: 'onFocusKeyChange'
  });

  const [expandedKeys, setExpandedKeys] = useControllableValue<
    IFileManagerContext['expandedKeys']
  >(props, {
    defaultValue: [],
    defaultValuePropName: 'defaultExpandedKeys',
    valuePropName: 'expandedKeys',
    trigger: 'onExpandedKeysChange'
  });

  const [editingKey, setEditingKey] = useControllableValue<
    IFileManagerContext['editingKey']
  >(props, {
    defaultValue: '',
    defaultValuePropName: 'defaultEditingKey',
    valuePropName: 'editingKey',
    trigger: 'onEditingKeyChange'
  });

  const rootTreeData = useMemo(() => {
    return treeData?.map((item) => convertTreeData(item));
  }, [treeData]);

  const activeOrFocusKey = focusKey || activeKey;

  const activeOrFocusTreeNode = useMemo(() => {
    return findTargetTreeNode(
      rootTreeData,
      (treeNode) => treeNode.key === activeOrFocusKey
    );
  }, [activeOrFocusKey, rootTreeData]);

  const activeOrFocusKeyRef = useLatest(activeOrFocusKey);
  const editingKeyRef = useLatest(editingKey);

  const highlightKey = useMemo(() => {
    if (activeOrFocusKey && expandedKeys.includes(activeOrFocusKey)) {
      return activeOrFocusKey;
    }

    return activeOrFocusTreeNode?.parent?.key;
  }, [activeKey, activeOrFocusTreeNode, expandedKeys]);

  const treeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        // @ts-expect-error
        (event.target && treeContainerRef?.current?.contains(event.target)) ||
        event.target === treeContainerRef?.current
      ) {
        return;
      }

      setFocusKey(undefined);
    }

    document.addEventListener('click', handleClick, false);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!activeOrFocusKeyRef.current) {
        return;
      }

      if (
        editingKeyRef.current &&
        editingKeyRef.current === activeOrFocusKeyRef.current
      ) {
        return;
      }

      if (event.key === 'Enter') {
        setEditingKey(activeOrFocusKeyRef.current);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={css.container}>
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
              let targetActiveNode = activeOrFocusTreeNode;
              if (
                activeOrFocusTreeNode?.isLeaf ||
                (!activeOrFocusTreeNode?.isLeaf &&
                  !expandedKeys.includes(targetActiveNode?.key || ''))
              ) {
                targetActiveNode = activeOrFocusTreeNode?.parent;
              }

              onAddFile?.(targetActiveNode);
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
      <div
        ref={treeContainerRef}
        className={classnames(css['file-tree-container'], {
          [css.focus]: focusKey === ROOT_FOCUS_KEY
        })}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setFocusKey(ROOT_FOCUS_KEY);
          }
        }}
      >
        <FileManagerContext.Provider
          value={{
            expandedKeys,
            setExpandedKeys,
            activeKey,
            setActiveKey,
            rootTreeData,
            highlightKey,
            onDragStart,
            focusKey,
            setFocusKey,
            editingKey,
            setEditingKey
          }}
        >
          {rootTreeData?.map((item) => <FileItem indent={0} treeData={item} />)}
        </FileManagerContext.Provider>
      </div>
    </div>
  );
}
