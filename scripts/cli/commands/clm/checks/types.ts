import { AddressBookChainId } from '../../../../common/config';
import { VaultConfig } from '../../../../../src/features/data/apis/config-types';
import { MismatchedRisksResult } from './risk-types';

export type Source = {
  id: string;
  chainId: AddressBookChainId;
  clm: VaultConfig;
  pool: VaultConfig | undefined;
  vault: VaultConfig | undefined;
};

export type Result = MismatchedRisksResult;
export type CheckerType = Result['type'];

export interface IChecker {
  readonly type: CheckerType;
  readonly description: string;
  check(source: Source): Promise<Result | undefined>;
  groupPrompt(results: Result[]): Promise<'back' | 'exit'>;
}

export type CheckerCreator = () => Promise<IChecker>;

export type CheckerCreators = {
  [K in CheckerType]: CheckerCreator;
};
