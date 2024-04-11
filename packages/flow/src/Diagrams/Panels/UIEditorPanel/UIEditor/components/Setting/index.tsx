import { useTree } from '@designable/react';
import { Button } from 'antd';

export function Setting() {
  const tree = useTree();
  return (
    <div>
      <Button
        onClick={() => {
          console.log('tree', tree);
        }}
      >
        Log
      </Button>
    </div>
  );
}
