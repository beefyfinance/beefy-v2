import { createSlice } from '@reduxjs/toolkit';
import { fetchAllZapsAction } from '../actions/zap';
import { ChainEntity } from '../entities/chain';
import { ZapEntity } from '../entities/zap';

/**
 * State containing Vault infos
 */
export type ZapsState = {
  byChainId: {
    [chainId: ChainEntity['id']]: ZapEntity[];
  };
};
const initialZapsState: ZapsState = {
  byChainId: {},
};

export const zapsSlice = createSlice({
  name: 'zaps',
  initialState: initialZapsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchAllZapsAction.fulfilled, (sliceState, action) => {
      for (const [chainId, zaps] of Object.entries(action.payload.byChainId)) {
        sliceState.byChainId[chainId] = zaps.map(zap => ({
          zapAddress: zap.zapAddress,
          ammRouter: zap.ammRouter,
          ammFactory: zap.ammFactory,
          ammPairInitHash: zap.ammPairInitHash,
          type: zap.type ?? 'uniswapv2',
          withdrawEstimateMode: zap.withdrawEstimateMode ?? 'getAmountOut',
          withdrawEstimateFee: zap.withdrawEstimateFee ?? '0',
          lpProviderFee: zap.lpProviderFee,
        }));
      }
    });
  },
});
