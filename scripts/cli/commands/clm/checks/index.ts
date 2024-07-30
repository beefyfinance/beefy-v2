import { createFactory } from '../../../utils/factory';
import { CheckerCreators, CheckerType } from './types';
import { MismatchedRisks } from './risks';
import { typedKeys } from '../../../utils/object';

export const checkers: CheckerCreators = {
  'mismatched-risks': createFactory(MismatchedRisks.create),
};

export async function getChecker(type: CheckerType) {
  const creator = checkers[type];
  if (!creator) {
    throw new Error(`Unknown checker type: ${type}`);
  }

  return creator();
}

export const getCheckers = createFactory(async () => {
  return await Promise.all(typedKeys(checkers).map(type => getChecker(type)));
});
