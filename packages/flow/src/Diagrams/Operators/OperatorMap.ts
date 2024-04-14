import { type MetaOperator } from './MetaOperator';
import { type Node } from 'reactflow';
import { type IMetaOperatorData } from './types';

type IOperatorMap = Map<MetaOperator['operatorType'], MetaOperator>;

const OperatorMap: IOperatorMap = new Map();

function registerOperator(operator: MetaOperator) {
  const currentOperator = OperatorMap.get(operator.operatorType);
  if (currentOperator) {
    if (currentOperator === operator) {
      console.warn(
        `duplicated register: ${operator.operatorType}:${operator.operatorName}`
      );
    } else {
      console.error(
        `register with same type: ${operator.operatorType}, current: ${currentOperator.operatorName}, next: ${operator.operatorName}`,
        {
          current: currentOperator,
          operator
        }
      );
    }
  }

  OperatorMap.set(operator.operatorType, operator);
}

export function registerOperators(operators: MetaOperator[]) {
  Object.values(operators).forEach((operator) => {
    registerOperator(operator);
  });
}

export function removeOperators(...operatorTypeList: string[]) {
  operatorTypeList.forEach((operationType) => {
    OperatorMap.delete(operationType);
  });
}

export function getOperatorFromOperatorType<T extends MetaOperator>(
  operatorType: string
) {
  return OperatorMap.get(operatorType) as T | undefined;
}

export function getOperatorFromNode<T extends MetaOperator>(
  node?: Partial<Pick<Node<any>, 'data'>>
) {
  return getOperatorFromOperatorType<T>(
    (node?.data as IMetaOperatorData)?.operatorType || ''
  );
}

export function getAllOperators() {
  return [...OperatorMap.values()];
}
