import { ApartmentOutlined } from '@ant-design/icons';
import { FileManager } from '../../components/FileManager';

export function UIPanel() {
  return (
    <FileManager
      treeData={[
        {
          title: 'App',
          key: 'App',
          isLeaf: true,
          icon: <ApartmentOutlined />,
          draggable: false
        }
      ]}
    />
  );
}
