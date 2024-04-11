import {
  Designer,
  Workbench,
  ViewPanel,
  DesignerToolsWidget,
  ViewToolsWidget,
  OutlineTreeWidget,
  ResourceWidget,
  StudioPanel,
  CompositePanel,
  WorkspacePanel,
  ToolbarPanel,
  ViewportPanel,
  SettingsPanel,
  HistoryWidget
} from '@designable/react';
import { SettingsForm, MonacoInput } from '@designable/react-settings-form';
import { createDesigner, createResource, createBehavior, GlobalRegistry } from '@designable/core';
import { Content } from './Content';
import { Input as AtdInput, Switch } from 'antd';
import { Setting } from './components/Setting';

const CompositePanelItem = CompositePanel.Item as NonNullable<typeof CompositePanel.Item>;

const RootBehavior = createBehavior({
  name: 'Root',
  selector: 'Root',
  designerProps: {
    droppable: true
  },
  designerLocales: {
    'zh-CN': {
      title: '根组件'
    },
    'en-US': {
      title: 'Root'
    }
  }
});

const InputBehavior = createBehavior({
  name: 'Input',
  selector: (node) => node.componentName === 'Input',
  designerProps: {
    propsSchema: {
      type: 'object',
      $namespace: 'Field',
      properties: {
        'field-properties': {
          type: 'void',
          'x-component': 'CollapseItem',
          title: '字段属性',
          properties: {
            title: {
              type: 'string',
              'x-decorator': 'FormItem',
              'x-component': AtdInput
            },

            readonly: {
              type: 'string',
              'x-decorator': 'FormItem',
              'x-component': Switch
            },

            placeholder: {
              'x-decorator': 'FormItem',
              'x-component': AtdInput
              // 'ValueInput'
            }
          }
        }
      }
    }
  },
  designerLocales: {
    'zh-CN': {
      title: '输入框',
      settings: {
        title: '标题',
        readonly: '只读',
        placeholder: 'placeholder'
      }
    }
  }
});

const CardBehavior = createBehavior({
  name: 'Card',
  selector: 'Card',
  designerProps: {
    droppable: true,
    resizable: {
      width(node, element) {
        const width = Number(node.props?.style?.width ?? element.getBoundingClientRect().width);
        return {
          plus: () => {
            node.props = node.props || {};
            node.props.style = node.props.style || {};
            node.props.style.width = width + 10;
          },
          minus: () => {
            node.props = node.props || {};
            node.props.style = node.props.style || {};
            node.props.style.width = width - 10;
          }
        };
      },
      height(node, element) {
        const height = Number(node.props?.style?.height ?? element.getBoundingClientRect().height);
        return {
          plus: () => {
            node.props = node.props || {};
            node.props.style = node.props.style || {};
            node.props.style.height = height + 10;
          },
          minus: () => {
            node.props = node.props || {};
            node.props.style = node.props.style || {};
            node.props.style.height = height - 10;
          }
        };
      }
    },
    translatable: {
      x(node, element, diffX) {
        const left = parseInt(node.props?.style?.left ?? element?.style.left) || 0;
        const rect = element.getBoundingClientRect();
        return {
          translate: () => {
            node.props = node.props || {};
            node.props.style = node.props.style || {};
            node.props.style.position = 'absolute';
            node.props.style.width = rect.width;
            node.props.style.height = rect.height;
            node.props.style.left = left + parseInt(String(diffX)) + 'px';
          }
        };
      },
      y(node, element, diffY) {
        const top = parseInt(node.props?.style?.top ?? element?.style.top) || 0;
        const rect = element.getBoundingClientRect();
        return {
          translate: () => {
            node.props = node.props || {};
            node.props.style = node.props.style || {};
            node.props.style.position = 'absolute';
            node.props.style.width = rect.width;
            node.props.style.height = rect.height;
            node.props.style.top = top + parseInt(String(diffY)) + 'px';
          }
        };
      }
    }
  },
  designerLocales: {
    'zh-CN': {
      title: '卡片'
    },
    'en-US': {
      title: 'Card'
    }
  }
});

GlobalRegistry.setDesignerBehaviors([RootBehavior, InputBehavior, CardBehavior]);

const Input = createResource({
  title: {
    'zh-CN': '输入框',
    'en-US': 'Input'
  },
  icon: 'InputSource',
  elements: [
    {
      componentName: 'Input'
    }
  ]
});

const Card = createResource({
  title: {
    'zh-CN': '卡片',
    'en-US': 'Card'
  },
  icon: 'CardSource',
  elements: [
    {
      componentName: 'Card',
      props: {
        title: '卡片'
      }
    }
  ]
});

GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    sources: {
      Inputs: '输入控件',
      Displays: '展示控件'
    }
  },
  'en-US': {
    sources: {
      Inputs: 'Inputs',
      Displays: 'Displays'
    }
  }
});

const engine = createDesigner();
export const UIEditor = () => {
  return (
    <Designer engine={engine}>
      <Workbench>
        <StudioPanel style={{ position: 'static', height: 'calc(100vh - 48px)' }}>
          <CompositePanel>
            <CompositePanelItem title="panels.Component" icon="Component">
              <ResourceWidget title="sources.Inputs" sources={[Input]} />
              <ResourceWidget title="sources.Displays" sources={[Card]} />
            </CompositePanelItem>
            <CompositePanelItem title="panels.OutlinedTree" icon="Outline">
              <OutlineTreeWidget />
            </CompositePanelItem>
            <CompositePanelItem title="panels.History" icon="History">
              <HistoryWidget />
            </CompositePanelItem>
            <CompositePanelItem title="Setting" icon="Setting">
              <Setting />
            </CompositePanelItem>
          </CompositePanel>
          <WorkspacePanel>
            <ToolbarPanel>
              <DesignerToolsWidget />
              <ViewToolsWidget />
            </ToolbarPanel>
            <ViewportPanel>
              <ViewPanel type="DESIGNABLE">{() => <Content />}</ViewPanel>
              <ViewPanel type="JSONTREE">
                {() => {
                  return (
                    <div style={{ overflow: 'hidden', height: '100%' }}>
                      <MonacoInput
                        language="javascript"
                        helpCode="//hello world"
                        defaultValue={`<div><div>123123<div>123123<div>123123<div>123123</div></div></div></div></div>`}
                      />
                    </div>
                  );
                }}
              </ViewPanel>
            </ViewportPanel>
          </WorkspacePanel>
          <SettingsPanel title="panels.PropertySettings">
            <SettingsForm uploadAction="https://www.mocky.io/v2/5cc8019d300000980a055e76" />
          </SettingsPanel>
        </StudioPanel>
      </Workbench>
    </Designer>
  );
};
