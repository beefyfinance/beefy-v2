import BigNumber from 'bignumber.js';
import { BeefyState } from '../../../redux/reducers/storev2';
import { BoostEntity } from '../../entities/boost';
import { TokenEntity } from '../../entities/token';
import { VaultEntity, VaultGov, VaultStandard } from '../../entities/vault';

export interface IAllowanceApi {
  fetchAllAllowances(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<FetchAllAllowanceResult>;
}

export interface TokenAllowance {
  tokenId: TokenEntity['id'];
  spenderAddress: string; // a 0x address
  allowance: BigNumber;
}

export type FetchAllAllowanceResult = TokenAllowance[];

export type AllValuesAsString<T> = {
  [key in keyof T]: string;
};
