import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { TokenAllowance } from '../apis/allowance/allowance-types';
import { TokenBalance } from '../apis/balance/balance-types';
import { getAllowanceApi, getBalanceApi } from '../apis/instances';
import { getEligibleZapOptions, ZapOptions } from '../apis/zap';
import { isGovVault, VaultEntity } from '../entities/vault';
import { selectChainById } from '../selectors/chains';
import { selectAddressBookTokenById } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';

export interface InitDepositFormParams {
  vaultId: VaultEntity['id'];
}

export interface InitDepositFormPayload {
  zapOptions: ZapOptions | null;

  // really, this should be separated
  walletAddress: string;
  balance: TokenBalance[];
  allowance: TokenAllowance[];
}

export const initiateDepositForm = createAsyncThunk<
  InitDepositFormPayload,
  InitDepositFormParams,
  { state: BeefyState }
>('chains/fetchChainConfigs', async ({ vaultId }, { getState }) => {
  const vault = selectVaultById(getState(), vaultId);
  const oracleToken = selectAddressBookTokenById(getState(), vault.id, vault.oracleId);
  const chain = selectChainById(getState(), vault.chainId);
  const walletAddress = selectWalletAddress(getState());

  // then, we need to find out the available zap options
  const zapOptions = await getEligibleZapOptions(getState(), vaultId);

  // then we want to know the balance and allowance for each route
  const tokens = (zapOptions.tokens || []).concat(oracleToken);

  const balanceApi = await getBalanceApi(chain);
  const balanceRes = await balanceApi.fetchAllBalances(getState(), tokens, [], [], walletAddress);
  const balance: InitDepositFormPayload['balance'] = balanceRes.tokens;

  const allowanceApi = await getAllowanceApi(chain);
  const allowanceRes = await allowanceApi.fetchAllAllowances(
    getState(),
    isGovVault(vault) ? [] : [vault],
    isGovVault(vault) ? [vault] : [],
    [],
    walletAddress
  );
  const allowance: InitDepositFormPayload['allowance'] = allowanceRes;

  return { walletAddress, allowance, balance, zapOptions };
});
