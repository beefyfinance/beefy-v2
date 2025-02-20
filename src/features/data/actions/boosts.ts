import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { TokenAllowance } from '../apis/allowance/allowance-types';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { getAllowanceApi, getBalanceApi } from '../apis/instances';
import type { BoostPromoEntity } from '../entities/promo';
import { selectBoostById } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectErc20TokenByAddress } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';
import { isGovVault } from '../entities/vault';

interface InitBoostFormParams {
  boostId: BoostPromoEntity['id'];
  walletAddress: string | undefined;
}

interface InitBoostFormPayload {
  walletAddress: string | undefined;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];
  boost: BoostPromoEntity;
}

export const initiateBoostForm = createAsyncThunk<
  InitBoostFormPayload,
  InitBoostFormParams,
  { state: BeefyState }
>('boosts/initBoostForm', async ({ boostId, walletAddress }, { getState }) => {
  const boost = selectBoostById(getState(), boostId);
  const vault = selectVaultById(getState(), boost.vaultId);
  if (isGovVault(vault)) {
    throw new Error(`Gov vaults do not support boosts`);
  }

  const chain = selectChainById(getState(), boost.chainId);

  const balanceApi = await getBalanceApi(chain);

  const balanceRes: FetchAllBalancesResult = walletAddress
    ? await balanceApi.fetchAllBalances(getState(), [], [], [boost], walletAddress)
    : { tokens: [], boosts: [], govVaults: [] };

  const spenderAddress = boost.contractAddress;

  const allowanceApi = await getAllowanceApi(chain);
  const mooToken = selectErc20TokenByAddress(
    getState(),
    boost.chainId,
    vault.receiptTokenAddress,
    false
  );
  const allowanceRes =
    walletAddress && spenderAddress
      ? await allowanceApi.fetchTokensAllowance(
          getState(),
          [mooToken],
          walletAddress,
          spenderAddress
        )
      : [];

  return {
    walletAddress,
    allowance: allowanceRes,
    balance: balanceRes,
    boost,
  };
});
