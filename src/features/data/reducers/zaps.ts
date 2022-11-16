import { createSlice } from '@reduxjs/toolkit';
import { fetchAllZapsAction } from '../actions/zap';
import { ChainEntity } from '../entities/chain';
import { ZapEntityBeefy, ZapEntityOneInch } from '../entities/zap';
import { AmmEntity } from '../entities/amm';

/**
 * State containing Vault infos
 */
export type ZapsState = {
  beefy: {
    byChainId: {
      [chainId: ChainEntity['id']]: ZapEntityBeefy[];
    };
    byAmmId: {
      [ammId: AmmEntity['id']]: ZapEntityBeefy;
    };
  };
  oneInch: {
    byChainId: {
      [chainId: ChainEntity['id']]: ZapEntityOneInch;
    };
  };
};
const initialZapsState: ZapsState = {
  beefy: {
    byChainId: {},
    byAmmId: {},
  },
  oneInch: {
    byChainId: {},
  },
};

export const zapsSlice = createSlice({
  name: 'zaps',
  initialState: initialZapsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchAllZapsAction.fulfilled, (sliceState, action) => {
      for (const zap of action.payload.beefy) {
        const typedZap: ZapEntityBeefy = {
          type: 'beefy',
          ...zap,
        };

        if (!(zap.ammId in sliceState.beefy.byAmmId)) {
          sliceState.beefy.byAmmId[zap.ammId] = typedZap;

          if (!(zap.chainId in sliceState.beefy.byChainId)) {
            sliceState.beefy.byChainId[zap.chainId] = [];
          }

          sliceState.beefy.byChainId[zap.chainId].push(typedZap);
        } else {
          console.warn(`Ignoring duplicate beefy zap for amm ${zap.ammId}`);
        }
      }

      for (const zap of action.payload.oneInch) {
        if (!(zap.chainId in sliceState.oneInch.byChainId)) {
          sliceState.oneInch.byChainId[zap.chainId] = {
            type: 'one-inch',
            ...zap,
          };
        } else {
          console.warn(`Ignoring duplicate 1inch zap for chain ${zap.chainId}`);
        }
      }
    });
  },
});
