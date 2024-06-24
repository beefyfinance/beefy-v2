import riskStrings from '../../src/locales/en/risks.json';

let strategyIdsCache:
  | { standard: Set<string>; gov: Set<string>; cowcentrated: Set<string> }
  | undefined;

export function getStrategyIds() {
  if (!strategyIdsCache) {
    strategyIdsCache = Object.keys(riskStrings).reduce(
      (acc, key) => {
        if (key.startsWith('StrategyDescription-')) {
          const strategyId = key.substring(20);
          if (strategyId.startsWith('gov-')) {
            acc.gov.add(strategyId.substring(4));
          } else if (strategyId.startsWith('cowcentrated-')) {
            const subStrategyId = strategyId.substring(13);
            if (subStrategyId.startsWith('gov-')) {
              acc.gov.add(subStrategyId.substring(4));
            } else {
              acc.cowcentrated.add(subStrategyId);
            }
          } else {
            acc.standard.add(strategyId);
          }
        }

        return acc;
      },
      {
        standard: new Set<string>(),
        gov: new Set<string>(),
        cowcentrated: new Set<string>(),
      }
    );
  }

  return strategyIdsCache;
}
