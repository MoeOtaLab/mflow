import classnames from 'classnames';
import css from './FileManager.module.less';
import { useContextSelector } from 'use-context-selector';
import {
  FolderOpenOutlined,
  FolderOutlined,
  FunctionOutlined,
  RightOutlined
} from '@ant-design/icons';
import { FileManagerContext, IHandledTreeDataNode } from './FileManagerContext';
import { useMemo, useState } from 'react';

export function FileItem(props: {
  treeData: IHandledTreeDataNode;
  indent: number;
}) {
  const { treeData, indent = 0 } = props;

  const setExpandedKeys = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.setExpandedKeys
  );
  const setActiveKey = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.setActiveKey
  );
  const setFocusKey = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.setFocusKey
  );
  const isActive = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.activeKey === treeData.key
  );
  const isFocus = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.focusKey === treeData.key
  );
  const isExpanded = useContextSelector(FileManagerContext, (ctx) =>
    ctx.expandedKeys?.includes(treeData.key)
  );

  const onDragStart = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.onDragStart
  );

  const highlightKey = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.highlightKey
  );

  const highlightIndex = useMemo(() => {
    let i = indent;
    let currentNode: IHandledTreeDataNode | undefined = treeData;
    while (currentNode) {
      if (currentNode.key === highlightKey) {
        return i;
      }

      currentNode = currentNode.parent;
      i--;
    }
  }, [highlightKey, treeData, indent]);

  const [draggingStart, setDraggingStart] = useState(false);

  return (
    <>
      <div
        draggable={treeData.isLeaf}
        onDragStart={(event) => {
          setDraggingStart(true);
          onDragStart?.(event, treeData);
          setTimeout(() => {
            setDraggingStart(false);
          }, 1);
        }}
        className={classnames(css['file-item'], {
          [css.selected]: isActive,
          [css.focus]: isFocus,
          [css['dragging-start']]: draggingStart
        })}
        onClick={() => {
          setFocusKey(treeData?.key);
          if (treeData.isLeaf) {
            setActiveKey(treeData?.key);
          } else {
            // directory
            setExpandedKeys((keys) => {
              const keySet = new Set(keys);
              if (keySet.has(treeData.key)) {
                keySet.delete(treeData.key);
              } else {
                keySet.add(treeData.key);
              }

              return [...keySet];
            });
          }
        }}
      >
        {Array.from({ length: indent }).map((_item, index) => (
          <div
            className={classnames(css.indent, {
              [css.highlight]: highlightIndex === index
            })}
            key={index}
          ></div>
        ))}
        {treeData.isLeaf ? null : (
          <div
            className={classnames(css['expand-icon'], {
              [css.expanded]: isExpanded
            })}
          >
            <RightOutlined />
          </div>
        )}
        {treeData.isLeaf ? (
          <div className={css['expand-icon-placeholder']}></div>
        ) : null}
        <div className={classnames(css['icon'])}>
          {treeData.isLeaf ? (
            <FunctionOutlined />
          ) : isExpanded ? (
            <FolderOpenOutlined />
          ) : (
            <FolderOutlined />
          )}
        </div>
        <div>{treeData.title}</div>
      </div>
      {isExpanded &&
        treeData.children?.map((item) => (
          <FileItem key={item.key} treeData={item} indent={indent + 1} />
        ))}
    </>
  );
}
