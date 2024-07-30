import {
  CowcentratedStrategyId,
  getCowcentratedStrategyIds,
} from '../../../lib/config/strategy-type';
import { select } from '@inquirer/prompts';
import { createFactory } from '../../../utils/factory';

export const createStrategyTypePrompt = createFactory(async () => {
  const strategyIds = await getCowcentratedStrategyIds();
  const validIds = new Set(strategyIds);
  const choices = strategyIds.map(strategyId => ({
    value: strategyId,
    name: strategyId,
  }));

  return async (message: string): Promise<CowcentratedStrategyId> => {
    while (true) {
      const strategyId = await select({
        message,
        choices,
      });
      if (strategyId && validIds.has(strategyId)) {
        return strategyId;
      }
    }
  };
});
