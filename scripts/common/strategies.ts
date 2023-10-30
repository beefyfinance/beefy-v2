import riskStrings from '../../src/locales/en/risks.json';
import partition from 'lodash/partition';

let strategyIdsCache: { gov: string[]; vault: string[] } | undefined;

export function getStrategyIds() {
  if (!strategyIdsCache) {
    const [gov, vault] = partition(
      Object.keys(riskStrings)
        .filter(key => key.startsWith('StrategyDescription-'))
        .map(key => key.substring(20)),
      key => key.startsWith('Gov-')
    );
    strategyIdsCache = {
      gov: gov.map(key => key.substring(4)),
      vault,
    };
  }

  return strategyIdsCache;
}
