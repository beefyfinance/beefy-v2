import BigNumber from 'bignumber.js';
import { BeefyState } from '../../../../redux-types';
import { BoostEntity } from '../../entities/boost';
import { TokenEntity, TokenErc20 } from '../../entities/token';
import { VaultGov, VaultStandard } from '../../entities/vault';

export interface IAllowanceApi {
  fetchAllAllowances(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<FetchAllAllowanceResult>;

  fetchTokensAllowance(
    state: BeefyState,
    tokens: TokenErc20[],
    walletAddress: string,
    spenderAddress: string
  );
}

export interface TokenAllowance {
  tokenAddress: TokenEntity['address'];
  spenderAddress: string; // a 0x address
  allowance: BigNumber;
}

export type FetchAllAllowanceResult = TokenAllowance[];
