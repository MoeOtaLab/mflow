import { createContext } from 'use-context-selector';

export type ITreeDataNode = {
  title: string;
  key: string | number;
  isLeaf?: boolean;
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
  rootTreeData: IHandledTreeDataNode[];
  highlightKey?: ITreeDataNode['key'];
  onDragStart?: (
    event: React.DragEvent<Element>,
    treeNode: IHandledTreeDataNode
  ) => void;
};

export const FileManagerContext = createContext<IFileManagerContext>({
  expandedKeys: [],
  setExpandedKeys: () => {},
  activeKey: '',
  highlightKey: '',
  setActiveKey: () => {},
  rootTreeData: []
});
