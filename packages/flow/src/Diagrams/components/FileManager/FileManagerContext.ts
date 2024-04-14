import { createContext } from 'use-context-selector';

export type ITreeDataNode = {
  title: string;
  key: string;
  isLeaf?: boolean;
  draggable?: boolean;
  icon?: React.ReactNode;
  children?: ITreeDataNode[];
};

export type IHandledTreeDataNode = ITreeDataNode & {
  parent?: ITreeDataNode;
};

export type IFileManagerContext = {
  expandedKeys: ITreeDataNode['key'][];
  setExpandedKeys: React.Dispatch<React.SetStateAction<ITreeDataNode['key'][]>>;
  activeKey?: ITreeDataNode['key'];
  setActiveKey: React.Dispatch<
    React.SetStateAction<ITreeDataNode['key'] | undefined>
  >;
  focusKey?: ITreeDataNode['key'];
  setFocusKey: React.Dispatch<
    React.SetStateAction<ITreeDataNode['key'] | undefined>
  >;
  editingKey?: ITreeDataNode['key'];
  setEditingKey: React.Dispatch<
    React.SetStateAction<ITreeDataNode['key'] | undefined>
  >;
  rootTreeData: IHandledTreeDataNode[];
  highlightKey?: ITreeDataNode['key'];
  pendingAddItem?: IHandledTreeDataNode;
  onDragStart?: (
    event: React.DragEvent<Element>,
    treeNode: IHandledTreeDataNode
  ) => void;

  handleFileChange?: (file: IHandledTreeDataNode) => void;
};

export const FileManagerContext = createContext<IFileManagerContext>({
  expandedKeys: [],
  setExpandedKeys: () => {},
  activeKey: '',
  focusKey: '',
  setFocusKey: () => {},
  highlightKey: '',
  setActiveKey: () => {},
  editingKey: '',
  pendingAddItem: undefined,
  setEditingKey: () => {},
  rootTreeData: [],
  handleFileChange: () => {}
});
