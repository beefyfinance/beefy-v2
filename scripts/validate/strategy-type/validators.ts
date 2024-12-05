import riskStrings from '../../../src/locales/en/risks.json';
import { createFactory } from '../../common/factory';

const regex =
  /^StrategyDescription-(?:(?<type>gov|cowcentrated|standard)-)?(?:(?<subtype>gov|cowcentrated|standard)-)?(?<id>.+)$/;

type VaultType = 'standard' | 'gov' | 'cowcentrated';

const getVaultTypeToStrategyTypeIds = createFactory(() => {
  return Object.keys(riskStrings).reduce(
    (acc, key) => {
      const match = key.match(regex);
      if (!match) {
        return acc;
      }

      const id = match.groups?.id;
      if (!id) {
        return acc;
      }

      const type = (match.groups?.subtype || match.groups?.type || 'standard') as VaultType;
      acc[type].add(id);
      return acc;
    },
    {
      standard: new Set<string>(),
      gov: new Set<string>(),
      cowcentrated: new Set<string>(),
    }
  );
});

export function doesStrategyTypeIdExistForVaultType(strategyId: string, vaultType: VaultType) {
  const lookup = getVaultTypeToStrategyTypeIds();
  return lookup[vaultType].has(strategyId);
}
