import { getOperatorFromOperatorType } from '../../../../Operators';
import { useDiagramsContextSelector } from '../../../../State/DiagramsProvider';

export function LayerIndicator() {
  const layerName = useDiagramsContextSelector((ctx) => {
    if (!ctx.layer?.relativeOperatorType) {
      return 'App';
    }

    const operator = getOperatorFromOperatorType(
      ctx.layer?.relativeOperatorType
    );

    return operator?.operatorName || operator?.operatorType || '';
  });

  return (
    <>
      <div style={{ color: 'white' }}>{layerName}</div>
    </>
  );
}
