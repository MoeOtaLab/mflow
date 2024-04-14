import {
  ApartmentOutlined,
  ControlOutlined,
  FunctionOutlined,
  SnippetsOutlined
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
            icon: <SnippetsOutlined rev="" />,
            key: 'Layers',
            label: 'Layers',
            content: <LayerPanel />
          },
          {
            icon: <ApartmentOutlined rev="" />,
            key: 'UI',
            label: 'UI',
            content: <div>coming soon</div>
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
