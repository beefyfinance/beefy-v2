import riskStrings from '../../src/locales/en/risks.json';

let strategyIdsCache:
  | { standard: Set<string>; gov: Set<string>; cowcentrated: Set<string>; erc4626: Set<string> }
  | undefined;

const regex =
  /^StrategyDescription-(?:(?<type>gov|cowcentrated|standard|erc4626)-)?(?:(?<subtype>gov|cowcentrated|standard|erc4626)-)?(?<id>.+)$/;

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
          | 'cowcentrated'
          | 'erc4626';
        acc[type].add(id);
        return acc;
      },
      {
        standard: new Set<string>(),
        gov: new Set<string>(),
        cowcentrated: new Set<string>(),
        erc4626: new Set<string>(),
      }
    );
  }

  return strategyIdsCache;
}
