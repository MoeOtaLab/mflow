import {
  ControlOutlined,
  FileAddOutlined,
  FunctionOutlined
} from '@ant-design/icons';
import { OperatorPanel } from '../OperatorPanel';
import { LayerPanel } from '../LayerPanel';
import { CommandPanel } from '../CommandPanel';
import { NavigationMenu } from './components/NavigationMenu';
import css from './LeftSidePanel.module.less';

export function LeftSidePanel() {
  return (
    <div className={css.container}>
      <NavigationMenu
        items={[
          {
            icon: <FunctionOutlined rev="" />,
            label: 'Operators',
            key: 'Operators',
            content: <OperatorPanel />
          },
          {
            icon: <FileAddOutlined rev="" />,
            key: 'Layers',
            label: 'Layers',
            content: <LayerPanel />
          },
          {
            icon: <ControlOutlined rev="" />,
            key: 'commands',
            label: 'commands',
            content: <CommandPanel />
          }
        ]}
      />
    </div>
  );
}
