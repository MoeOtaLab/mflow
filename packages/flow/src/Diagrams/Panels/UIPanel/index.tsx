import { ApartmentOutlined } from '@ant-design/icons';
import { ActionButtonEnum, FileManager } from '../../components/FileManager';
import { useUIEditorContext } from '../UIEditorPanel/UIEditorContext';
import { ITreeNode } from '@designable/core';
import { Button } from 'antd';

function convertTreeData<T extends { children?: T[] }>(
  treeData: ITreeNode,
  callback: (node: ITreeNode) => T
): T {
  const currentNode = callback(treeData);

  currentNode.children = treeData.children?.map((item) =>
    convertTreeData(item, callback)
  );

  return currentNode;
}

export function UIPanel() {
  const { currentTreeData } = useUIEditorContext();

  return (
    <div>
      <span>go to UI Editor</span>
      <FileManager
        expandAll={true}
        showButtonList={[ActionButtonEnum.Refresh]}
        defaultExpandedKeys={['App']}
        treeData={
          !currentTreeData
            ? []
            : [
                convertTreeData(currentTreeData, (item) => {
                  return {
                    title: `(${item.componentName})${item?.props?.title || ''}`,
                    key: item.id || '',
                    isLeaf: true,
                    draggable: false,
                    icon: <ApartmentOutlined />,
                    children: []
                  };
                })
              ]
        }
      />
    </div>
  );
}
