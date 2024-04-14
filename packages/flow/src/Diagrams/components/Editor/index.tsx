import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  type ForwardedRef
} from 'react';
import classnames from 'classnames';
import * as monaco from 'monaco-editor';
import styles from './Editor.module.less';
import { useUpdateEffect } from 'ahooks';

export interface IEditorRefType {
  editor: monaco.editor.IStandaloneCodeEditor | null;
}

function _Editor(
  props: {
    /** half controlled */
    code: string;
    className?: string;
    readonly?: boolean;
    language: string;
  },
  ref: ForwardedRef<IEditorRefType>
) {
  const { code, className, readonly, language } = props;

  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef(null);

  useEffect(() => {
    if (monacoEl) {
      setEditor((editor) => {
        if (editor) return editor;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return monaco.editor.create(monacoEl.current!, {
          value: code,
          language,
          readOnly: readonly
        });
      });
    }

    return () => editor?.dispose();
  }, [monacoEl.current]);

  useUpdateEffect(() => {
    async function updateValue() {
      if (editor) {
        editor.setValue(code);

        if (readonly) {
          editor.updateOptions({
            readOnly: false
          });
        }

        await editor.getAction('editor.action.formatDocument')?.run();
        if (readonly) {
          editor.updateOptions({
            readOnly: true
          });
        }
      }
    }
    updateValue();
  }, [code]);

  useImperativeHandle(
    ref,
    () => ({
      editor
    }),
    [editor]
  );

  return (
    <div className={classnames(styles.editor, className)} ref={monacoEl}></div>
  );
}

export const Editor = forwardRef(_Editor);
