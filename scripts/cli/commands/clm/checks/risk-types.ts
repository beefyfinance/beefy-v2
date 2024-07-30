import { VaultRisk, VaultRiskId } from '../../../lib/config/risk';
import { BuildResult } from './helper-types';

export type RiskSet = {
  valid: boolean;
  validIds: VaultRiskId[];
  validRisks: VaultRisk[];
  allIds: string[];
};

export type MismatchedRisksResult = BuildResult<
  'mismatched-risks',
  {
    clm: RiskSet;
    sets: Array<{ source: 'clm' | 'pool' | 'vault' } & RiskSet>;
  }
>;
