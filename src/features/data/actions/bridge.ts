import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { TokenAllowance } from '../apis/allowance/allowance-types';
import { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { getAllowanceApi, getBalanceApi, getBridgeApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { isTokenErc20 } from '../entities/token';
import { selectChainById } from '../selectors/chains';
import { selectTokenByAddress } from '../selectors/tokens';
import { selectCurrentChainId } from '../selectors/wallet';

export interface FulfilledBridgeData {
  data: unknown;
}

export interface FetchBridgeChainDataParams {
  chainId: ChainEntity['id'];
}

export const fetchBridgeChainData = createAsyncThunk<
  unknown,
  FetchBridgeChainDataParams,
  { state: BeefyState }
>('bridge/fetchBridgeChainData', async ({ chainId }, { getState }) => {
  const chain = selectChainById(getState(), chainId);
  const api = getBridgeApi();
  const data = await api.getBridgeChainData(chain.networkChainId);
  return { data };
});

export const getBridgeTxData = async (hash: string) => {
  const api = getBridgeApi();
  const res: any = await api.getTxStatus(hash);
  return res.data;
};

interface InitBridgeFormParams {
  walletAddress: string | null;
}

interface InitBridgeFormPayload {
  chainId: ChainEntity['id'];
  walletAddress: string | null;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];
  destChainId: ChainEntity['id'];
  destChainInfo: any;
  state: BeefyState;
}

export const initiateBridgeForm = createAsyncThunk<
  InitBridgeFormPayload,
  InitBridgeFormParams,
  { state: BeefyState }
>('bridge/initiateBridgeForm', async ({ walletAddress }, { getState }) => {
  const chainId = selectCurrentChainId(getState());
  const chain = selectChainById(getState(), chainId ?? 'bsc');
  const destChain = selectChainById(getState(), chain.id === 'bsc' ? 'fantom' : 'bsc');
  const balanceApi = await getBalanceApi(chain);
  const allowanceApi = await getAllowanceApi(chain);
  const bridgeApi = await getBridgeApi();

  const bridgeDataRes: any = await bridgeApi.getBridgeChainData(chain.networkChainId);

  const spenderInfo: any = Object.values(bridgeDataRes.destChains[destChain.networkChainId])[0];

  const spenderAddress = spenderInfo.DepositAddress ?? spenderInfo.routerToken;

  const depositToken = selectTokenByAddress(getState(), chain.id, bridgeDataRes.address);

  const balanceRes: FetchAllBalancesResult = walletAddress
    ? await balanceApi.fetchAllBalances(getState(), [depositToken], [], [], walletAddress)
    : { tokens: [], govVaults: [], boosts: [] };

  const allowanceRes =
    walletAddress && spenderAddress && isTokenErc20(depositToken)
      ? await allowanceApi.fetchTokensAllowance(
          getState(),
          [depositToken],
          walletAddress,
          spenderAddress
        )
      : [];

  return {
    chainId: chain.id,
    destChainId: destChain.id,
    walletAddress,
    allowance: allowanceRes,
    balance: balanceRes,
    destChainInfo: bridgeDataRes,
    state: getState(),
  };
});
