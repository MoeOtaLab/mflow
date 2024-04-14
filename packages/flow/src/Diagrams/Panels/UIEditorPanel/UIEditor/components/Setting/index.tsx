import { useTree } from '@designable/react';
import { Button } from 'antd';
import { useUIEditorContext } from '../../../UIEditorContext';

export function Setting() {
  const tree = useTree();
  const { setCurrentTreeData, currentTreeData } = useUIEditorContext();

  return (
    <div>
      <Button
        type="text"
        onClick={() => {
          const serializeTree = tree.serialize();
          console.log('tree', {
            tree,
            serializeTree,
            currentTreeData
          });
        }}
      >
        Log
      </Button>
      <Button
        type="text"
        onClick={() => {
          setCurrentTreeData(tree.serialize());
        }}
      >
        Save
      </Button>
    </div>
  );
}
