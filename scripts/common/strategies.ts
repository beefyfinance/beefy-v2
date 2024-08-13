import riskStrings from '../../src/locales/en/risks.json';

let strategyIdsCache:
  | { standard: Set<string>; gov: Set<string>; cowcentrated: Set<string> }
  | undefined;

const regex =
  /^StrategyDescription-(?:(?<type>gov|cowcentrated|standard)-)?(?:(?<subtype>gov|cowcentrated|standard)-)?(?<id>.+)$/;

export function getStrategyIds() {
  if (!strategyIdsCache) {
    strategyIdsCache = Object.keys(riskStrings).reduce(
      (acc, key) => {
        const match = key.match(regex);
        if (!match) {
          return acc;
        }

        const id = match.groups?.id;
        if (!id) {
          return acc;
        }

        const type = (match.groups?.subtype || match.groups?.type || 'standard') as
          | 'standard'
          | 'gov'
          | 'cowcentrated';
        acc[type].add(id);
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
