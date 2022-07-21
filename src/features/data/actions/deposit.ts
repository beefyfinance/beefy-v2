import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { TokenAllowance } from '../apis/allowance/allowance-types';
import { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { getAllowanceApi, getBalanceApi } from '../apis/instances';
import { getEligibleZapOptions } from '../apis/zap/zap';
import { isTokenErc20, TokenEntity } from '../entities/token';
import { isGovVault, isStandardVault, VaultEntity } from '../entities/vault';
import { selectChainById } from '../selectors/chains';
import { selectTokenByAddress } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';
import { ZapOptions } from '../apis/zap/zap-types';

interface InitDepositFormParams {
  vaultId: VaultEntity['id'];
  walletAddress: string | null;
}

interface InitDepositFormPayload {
  vaultId: VaultEntity['id'];
  zapOptions: ZapOptions | null;

  // really, this should be separated
  walletAddress: string | null;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];

  // reducers below need to access the state
  state: BeefyState;
}

export const initiateDepositForm = createAsyncThunk<
  InitDepositFormPayload,
  InitDepositFormParams,
  { state: BeefyState }
>('deposit/initiateDepositForm', async ({ vaultId, walletAddress }, { getState }) => {
  const vault = selectVaultById(getState(), vaultId);
  // we cannot select the addressbook token as the vault token can be an LP token
  const depositToken = selectTokenByAddress(getState(), vault.chainId, vault.depositTokenAddress);
  const earnedToken = selectTokenByAddress(getState(), vault.chainId, vault.earnedTokenAddress);
  const chain = selectChainById(getState(), vault.chainId);

  // then, we need to find out the available zap options
  const zapOptions = isStandardVault(vault) ? getEligibleZapOptions(getState(), vaultId) : null;

  // then we want to know the balance and allowance for each route
  const tokens: TokenEntity[] = [depositToken, earnedToken].concat(zapOptions?.tokens || []);

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

  let allowance: TokenAllowance[] = [];
  const allowanceApi = await getAllowanceApi(chain);

  // get allowance for zap options
  if (walletAddress && zapOptions) {
    const zapTokens = zapOptions.tokens.filter(isTokenErc20);
    const allowanceRes = await allowanceApi.fetchTokensAllowance(
      getState(),
      zapTokens,
      walletAddress,
      zapOptions.address
    );
    allowance = allowance.concat(allowanceRes);
  }

  // get allowance for non-zap options
  if (walletAddress) {
    const spenderAddress = vault.earnContractAddress;
    const vaultTokens = [depositToken, earnedToken].filter(isTokenErc20);
    const allowanceRes = await allowanceApi.fetchTokensAllowance(
      getState(),
      vaultTokens,
      walletAddress,
      spenderAddress
    );
    allowance = allowance.concat(allowanceRes);
  }

  return { walletAddress, allowance, balance: balanceRes, zapOptions, vaultId, state: getState() };
});
