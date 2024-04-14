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
import { useEffect, useMemo, useRef, useState } from 'react';

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

  const isEditing = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.editingKey === treeData.key
  );

  const setEditingKey = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.setEditingKey
  );

  const pendingAddItem = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.pendingAddItem
  );

  const handleFileChange = useContextSelector(
    FileManagerContext,
    (ctx) => ctx.handleFileChange
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

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

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
          [css.focus]: isFocus && !isEditing,
          [css['dragging-start']]: draggingStart
        })}
        onClick={() => {
          if (isEditing) {
            return;
          }

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
        <div
          className={classnames(css.title, {
            [css.editing]: isEditing
          })}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              className={css.input}
              type="text"
              defaultValue={treeData.title}
              onBlur={(event) => {
                handleFileChange?.({
                  ...treeData,
                  title: event.target.value
                });
                setEditingKey(undefined);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleFileChange?.({
                    ...treeData,
                    // @ts-expect-error
                    title: event.target.value
                  });
                  event.stopPropagation();
                  setEditingKey(undefined);
                }
              }}
            />
          ) : (
            treeData.title
          )}
        </div>
      </div>
      {isExpanded &&
        treeData.children?.map((item) => (
          <FileItem key={item.key} treeData={item} indent={indent + 1} />
        ))}
      {pendingAddItem && pendingAddItem.parent?.key === treeData.key && (
        <FileItem
          key={pendingAddItem.key}
          treeData={pendingAddItem}
          indent={indent + 1}
        />
      )}
    </>
  );
}
