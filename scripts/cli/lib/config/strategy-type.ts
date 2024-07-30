import riskStrings from '../../../../src/locales/en/risks.json';
import { ExtractStartsRest } from '../../utils/types';
import { createFactory } from '../../utils/factory';

type RiskStringsById = typeof riskStrings;
type RiskStringId = keyof RiskStringsById;

type StrategyIds = ExtractStartsRest<RiskStringId, 'StrategyDescription-'>;
type CowcentratedAnyStrategyId = ExtractStartsRest<StrategyIds, 'cowcentrated-'>;
type CowcentratedPoolStrategyId = ExtractStartsRest<CowcentratedAnyStrategyId, 'gov-'>;
type CowcentratedVaultStrategyId = ExtractStartsRest<CowcentratedAnyStrategyId, 'standard-'>;
export type CowcentratedStrategyId = Exclude<
  CowcentratedAnyStrategyId,
  `gov-${CowcentratedPoolStrategyId}` | `standard-${CowcentratedVaultStrategyId}`
>;

export const getCowcentratedStrategyIds = createFactory(
  async (): Promise<CowcentratedStrategyId[]> => {
    const module = await import('../../../../src/locales/en/risks.json');
    return Object.keys(module.default)
      .filter(
        key =>
          key.startsWith('StrategyDescription-cowcentrated-') &&
          !key.startsWith('StrategyDescription-cowcentrated-gov') &&
          !key.startsWith('StrategyDescription-cowcentrated-standard')
      )
      .map(key =>
        key.replace(/^StrategyDescription-cowcentrated-/, '')
      ) as CowcentratedStrategyId[];
  }
);
