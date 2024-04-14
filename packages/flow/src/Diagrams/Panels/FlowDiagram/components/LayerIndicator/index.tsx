import { Button, Input, InputRef, Modal, message } from 'antd';
import {
  getOperatorFromOperatorType,
  registerOperators
} from '../../../../Operators';
import {
  useDiagramsContextSelector,
  useDiagramsState,
  useDiagramsActions
} from '../../../../State/DiagramsProvider';
import { useOperators } from '../../../../State/OperatorProvider';
import { CustomOperator } from '../../../../Operators/CustomOperator';
import { Layer } from '../../../../State/Layer';

export function LayerIndicator() {
  const layerName = useDiagramsContextSelector((ctx) => {
    if (!ctx.layer?.relativeOperatorType) {
      return '';
    }

    const operator = getOperatorFromOperatorType(
      ctx.layer?.relativeOperatorType
    );

    return operator?.operatorName || operator?.operatorType || '';
  });

  const { layer } = useDiagramsState();
  const { setDefaultLayer, setLayer, setActiveLayerId } = useDiagramsActions();

  const { refreshOperators } = useOperators();

  return (
    <div
      style={{ display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' }}
    >
      {layerName && <div style={{ color: 'white' }}>{layerName}</div>}
      {!layerName && (
        <Button
          type="text"
          style={{ color: 'white' }}
          onClick={() => {
            let name = '';
            function addCustomOperator() {
              if (!name) {
                message.warning('Please input name');
                return;
              }

              const customOperator = new CustomOperator(name);
              customOperator.replaceContent({ layer });

              registerOperators([customOperator]);
              refreshOperators();

              const newUntitledLayer = new Layer('Untitled');
              setDefaultLayer(newUntitledLayer);
            }

            let inputRef: InputRef | undefined | null;
            const instance = Modal.info({
              title: 'Custom Operator Name',
              content: (
                <div>
                  <Input
                    ref={(ref) => {
                      inputRef = ref;
                    }}
                    onChange={(e) => {
                      name = e.target.value || '';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        instance.destroy();
                        addCustomOperator();
                      }
                    }}
                  />
                </div>
              ),
              onOk() {
                addCustomOperator();
              }
            });

            setTimeout(() => {
              console.log('inputRef', inputRef);
              inputRef?.input?.focus();
            }, 200);
          }}
        >
          Save As
        </Button>
      )}
    </div>
  );
}
