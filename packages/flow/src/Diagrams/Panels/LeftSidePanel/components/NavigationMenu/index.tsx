import classnames from 'classnames';
import { useControllableValue, useLatest } from 'ahooks';
import { useMemo, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import css from './NavigationMenu.module.less';

type INavigationMenuItem = {
  key: string;
  label?: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

type INavigationMenuProps = {
  activeKey?: string;
  onChange?: (activeKey: string) => void;
  items: INavigationMenuItem[];
};

export function NavigationMenu(props: INavigationMenuProps) {
  const { activeKey: activeKeyProp, items } = props;

  const defaultActiveKey = activeKeyProp || items?.[0]?.key;

  const [activeKey, setActiveKey] = useControllableValue<string | undefined>(
    props,
    {
      valuePropName: 'activeKey',
      defaultValue: defaultActiveKey
    }
  );

  const lastActiveKeyRef = useRef(activeKey);

  const [cacheKeySet] = useState(
    () => new Set<string | undefined>([defaultActiveKey])
  );

  useMemo(() => {
    cacheKeySet.add(activeKey);
    if (activeKey) {
      lastActiveKeyRef.current = activeKey;
    }
  }, [activeKey]);

  const activeKeyRef = useLatest(activeKey);

  const containerRef = useRef<HTMLDivElement>(null);

  const defaultWidth = 200;
  const [width, setWidth] = useState<number>(200);
  function resetWidth() {
    setWidth(defaultWidth);
  }

  return (
    <div className={css.container}>
      <div className={css['icon-container']}>
        {items.map((item) => (
          <Tooltip
            key={item.key}
            placement="right"
            arrow={false}
            title={item.label}
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
          >
            <div
              className={classnames(css.icon, {
                [css.active]: item.key === activeKey
              })}
              onClick={() => {
                if (activeKey === item.key) {
                  setActiveKey(undefined);
                } else {
                  setActiveKey(item.key);
                }
              }}
            >
              {item.icon}
            </div>
          </Tooltip>
        ))}
      </div>
      <div
        className={css['content-container']}
        ref={containerRef}
        style={width !== undefined ? { width } : undefined}
      >
        {items.map((item) => {
          if (!cacheKeySet.has(item.key) && item.key !== activeKey) {
            return null;
          }

          return (
            <div
              key={item.key}
              className={css['content']}
              style={item.key === activeKey ? {} : { display: 'none' }}
            >
              {item.content}
            </div>
          );
        })}
        <div
          className={css['resize-bar']}
          onMouseDown={(event) => {
            const initMouseOffset = event.clientX;
            const initRect = containerRef.current!.getBoundingClientRect();
            const initOffset = initMouseOffset - initRect.x - initRect.width;
            function handleMouseMove(event: MouseEvent) {
              const currentMouseX = event.clientX;
              const rect = containerRef.current!.getBoundingClientRect();
              const targetWidth = currentMouseX - rect.x - initOffset;
              const throltte = 8;
              setWidth(
                activeKeyRef.current
                  ? Math.min(
                      window.innerWidth * 0.8,
                      Math.max(targetWidth, throltte)
                    )
                  : 0
              );
              if (targetWidth < throltte) {
                setActiveKey(undefined);
                setWidth(0);
              }

              if (!activeKeyRef.current && targetWidth >= throltte) {
                setActiveKey(lastActiveKeyRef.current || defaultActiveKey);
              }
            }

            function handleMouseUp() {
              if (!activeKeyRef.current) {
                resetWidth();
              }
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            }

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        ></div>
      </div>
    </div>
  );
}
