import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getConfigApi } from '../apis/instances';
import { estimateZapDeposit, estimateZapWithdraw } from '../apis/zap/zap';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';
import { ZapConfig } from '../apis/config-types';
import { ZapDepositEstimate, ZapWithdrawEstimate } from '../apis/zap/zap-types';

interface FetchAllZapFulfilledPayload {
  byChainId: {
    [chainId: ChainEntity['id']]: ZapConfig[];
  };
  // reducers need the state (balance)
  state: BeefyState;
}

// TODO: To be more efficient we could only load zaps for one chain at a time
export const fetchAllZapsAction = createAsyncThunk<
  FetchAllZapFulfilledPayload,
  {},
  { state: BeefyState }
>('zap/fetchAllZapsAction', async (_, { getState }) => {
  const api = getConfigApi();
  const zaps = await api.fetchZapsConfig();
  return { byChainId: zaps, state: getState() };
});

interface FetchEstimateZapDepositFulfilledPayload {
  vaultId: VaultEntity['id'];
  inputTokenId: TokenEntity['id'];
  zapEstimate: ZapDepositEstimate;
}

interface FetchEstimateZapDepositParams {
  vaultId: VaultEntity['id'];
  inputTokenId: TokenEntity['id'];
}

export const fetchEstimateZapDeposit = createAsyncThunk<
  FetchEstimateZapDepositFulfilledPayload,
  FetchEstimateZapDepositParams,
  { state: BeefyState }
>('zap/fetchEstimateZapDeposit', async ({ vaultId, inputTokenId }, { getState }) => {
  const zapEstimate = await estimateZapDeposit(getState(), vaultId, inputTokenId);
  return { vaultId, inputTokenId, zapEstimate };
});

interface FetchEstimateZapWithdrawFulfilledPayload {
  vaultId: VaultEntity['id'];
  outputTokenId: TokenEntity['id'];
  zapEstimate: ZapWithdrawEstimate;
}

interface FetchEstimateZapWithdrawParams {
  vaultId: VaultEntity['id'];
  outputTokenId: TokenEntity['id'];
}

export const fetchEstimateZapWithdraw = createAsyncThunk<
  FetchEstimateZapWithdrawFulfilledPayload,
  FetchEstimateZapWithdrawParams,
  { state: BeefyState }
>('zap/fetchEstimateZapWithdraw', async ({ vaultId, outputTokenId }, { getState }) => {
  const zapEstimate = await estimateZapWithdraw(getState(), vaultId, outputTokenId);
  return { vaultId, outputTokenId, zapEstimate };
});
