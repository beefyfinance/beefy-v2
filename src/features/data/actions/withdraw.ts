import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { TokenAllowance } from '../apis/allowance/allowance-types';
import { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { getAllowanceApi, getBalanceApi } from '../apis/instances';
import { getEligibleZapOptions, ZapOptions } from '../apis/zap';
import { isTokenErc20, TokenEntity } from '../entities/token';
import { isGovVault, isStandardVault, VaultEntity } from '../entities/vault';
import { selectChainById } from '../selectors/chains';
import { selectTokenById } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';

interface InitWithdrawFormParams {
  vaultId: VaultEntity['id'];
  walletAddress: string | null;
}

interface InitWithdrawFormPayload {
  vaultId: VaultEntity['id'];
  zapOptions: ZapOptions | null;

  // really, this should be separated
  walletAddress: string | null;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];

  // reducers below need to access the state
  state: BeefyState;
}

export const initiateWithdrawForm = createAsyncThunk<
  InitWithdrawFormPayload,
  InitWithdrawFormParams,
  { state: BeefyState }
>('withdraw/initiateWithdrawForm', async ({ vaultId, walletAddress }, { getState }) => {
  const vault = selectVaultById(getState(), vaultId);
  // we cannot select the addressbook token as the vault token can be an LP token
  const oracleToken = selectTokenById(getState(), vault.chainId, vault.oracleId);
  const earnedToken = selectTokenById(getState(), vault.chainId, vault.earnedTokenId);
  const chain = selectChainById(getState(), vault.chainId);

  // then, we need to find out the available zap options
  const zapOptions = isStandardVault(vault)
    ? await getEligibleZapOptions(getState(), vaultId)
    : null;

  // then we want to know the balance and allowance for each route
  const tokens: TokenEntity[] = [oracleToken, earnedToken].concat(zapOptions?.tokens || []);
  const tokensErc20 = tokens.filter(isTokenErc20);

  const balanceApi = await getBalanceApi(chain);
  const balanceRes: FetchAllBalancesResult = walletAddress
    ? await balanceApi.fetchAllBalances(
        getState(),
        tokens,
        isGovVault(vault) ? [vault] : [],
        [],
        walletAddress
      )
    : { tokens: [], boosts: [], govVaults: [] };

  const spenderAddress = zapOptions
    ? zapOptions.address
    : isStandardVault(vault)
    ? vault.contractAddress
    : vault.earnContractAddress;

  const allowanceApi = await getAllowanceApi(chain);
  const allowanceRes =
    walletAddress && spenderAddress
      ? await allowanceApi.fetchTokensAllowance(tokensErc20, walletAddress, spenderAddress)
      : [];
  const allowance: TokenAllowance[] = allowanceRes;

  return { walletAddress, allowance, balance: balanceRes, zapOptions, vaultId, state: getState() };
});
