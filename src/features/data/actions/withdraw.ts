import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { TokenAllowance } from '../apis/allowance/allowance-types';
import { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import { getAllowanceApi, getBalanceApi, getContractDataApi } from '../apis/instances';
import { getEligibleZapOptions } from '../apis/zap/zap';
import { isTokenErc20, TokenEntity } from '../entities/token';
import { isGovVault, isStandardVault, VaultEntity } from '../entities/vault';
import { selectChainById } from '../selectors/chains';
import { selectTokenByAddress } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';
import { ZapOptions } from '../apis/zap/zap-types';

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
  contractData: FetchAllContractDataResult;

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
  const depositToken = selectTokenByAddress(getState(), vault.chainId, vault.depositTokenAddress);
  const earnedToken = selectTokenByAddress(getState(), vault.chainId, vault.earnedTokenAddress);
  const chain = selectChainById(getState(), vault.chainId);

  // then, we need to find out the available zap options
  const zapOptions = isStandardVault(vault) ? getEligibleZapOptions(getState(), vaultId) : null;

  // we need to reload the price per full share of the vault
  const contractDataApi = await getContractDataApi(chain);
  const contractDataRes = await contractDataApi.fetchAllContractData(
    getState(),
    isStandardVault(vault) ? [vault] : [],
    isGovVault(vault) ? [vault] : [],
    []
  );

  // then we want to know the balance and allowance for each route
  const tokens: TokenEntity[] = [depositToken, earnedToken].concat(zapOptions?.tokens || []);
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

  const spenderAddress = zapOptions ? zapOptions.address : vault.earnContractAddress;

  const allowanceApi = await getAllowanceApi(chain);
  const allowanceRes =
    walletAddress && spenderAddress
      ? await allowanceApi.fetchTokensAllowance(
          getState(),
          tokensErc20,
          walletAddress,
          spenderAddress
        )
      : [];

  return {
    walletAddress,
    allowance: allowanceRes,
    balance: balanceRes,
    contractData: contractDataRes,
    zapOptions,
    vaultId,
    state: getState(),
  };
});
