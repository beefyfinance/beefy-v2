import type { TokenAllowance } from '../apis/allowance/allowance-types.ts';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types.ts';
import { getAllowanceApi, getBalanceApi } from '../apis/instances.ts';
import type { BoostPromoEntity } from '../entities/promo.ts';
import { isGovVault } from '../entities/vault.ts';
import { selectBoostById } from '../selectors/boosts.ts';
import { selectChainById } from '../selectors/chains.ts';
import { selectErc20TokenByAddress } from '../selectors/tokens.ts';
import { selectVaultById } from '../selectors/vaults.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

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

export const initiateBoostForm = createAppAsyncThunk<InitBoostFormPayload, InitBoostFormParams>(
  'boosts/initBoostForm',
  async ({ boostId, walletAddress }, { getState }) => {
    const boost = selectBoostById(getState(), boostId);
    const vault = selectVaultById(getState(), boost.vaultId);
    if (isGovVault(vault)) {
      throw new Error(`Gov vaults do not support boosts`);
    }

    const chain = selectChainById(getState(), boost.chainId);

    const balanceApi = await getBalanceApi(chain);

    const balanceRes: FetchAllBalancesResult =
      walletAddress ?
        await balanceApi.fetchAllBalances(getState(), { boosts: [boost] }, walletAddress)
      : { tokens: [], boosts: [], govVaults: [], erc4626Pending: [] };

    const spenderAddress = boost.contractAddress;

    const allowanceApi = await getAllowanceApi(chain);
    const mooToken = selectErc20TokenByAddress(
      getState(),
      boost.chainId,
      vault.receiptTokenAddress,
      false
    );
    const allowanceRes =
      walletAddress && spenderAddress ?
        await allowanceApi.fetchTokensAllowance(
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
  }
);
