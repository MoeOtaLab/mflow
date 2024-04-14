import {
  ApartmentOutlined,
  FunctionOutlined,
  RocketOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { OperatorPanel } from '../OperatorPanel';
import { CommandPanel } from '../CommandPanel';
import { DebugPanel } from '../ConsolePanel/DebugPanel';
import { UIPanel } from '../UIPanel';

import { NavigationMenu } from './components/NavigationMenu';
import css from './LeftSidePanel.module.less';

export function LeftSidePanel() {
  return (
    <div className={css.container}>
      <NavigationMenu
        items={[
          {
            icon: <FunctionOutlined />,
            label: 'Operators',
            key: 'Operators',
            content: <OperatorPanel />
          },
          {
            icon: <ApartmentOutlined />,
            key: 'UI',
            label: 'UI',
            content: <UIPanel />
          },
          {
            icon: <RocketOutlined />,
            key: 'Debug',
            label: 'Debug',
            content: <DebugPanel />
          },
          {
            icon: <SettingOutlined />,
            key: 'Commands',
            label: 'Commands',
            content: <CommandPanel />
          }
        ]}
      />
    </div>
  );
}
