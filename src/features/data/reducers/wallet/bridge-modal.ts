import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import {
  BIG_ZERO,
  formatBigDecimals,
  formatBigNumberSignificant,
} from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { initiateBridgeForm } from '../../actions/bridge';
import { ChainEntity } from '../../entities/chain';
import { selectUserBalanceOfToken } from '../../selectors/balance';
import { selectBifiBridgeDataByChainId } from '../../selectors/bridge';
import { selectChainById } from '../../selectors/chains';
import { selectTokenByAddress } from '../../selectors/tokens';

export type BridgeModalState = {
  destChain: ChainEntity['id'];
  max: boolean;
  amount: BigNumber;
  formattedInput: string;
  destChainInfo: any;
};

const initialBridgeModalState: BridgeModalState = {
  destChain: 'fantom',
  amount: BIG_ZERO,
  formattedInput: '',
  max: false,
  destChainInfo: {},
};

export const bridgeModalSlice = createSlice({
  name: 'bridge-modal',
  initialState: initialBridgeModalState,
  reducers: {
    setMax(
      sliceState,
      action: PayloadAction<{
        chainId: string;
        tokenAddress: string;
        state: BeefyState;
      }>
    ) {
      const { state, chainId, tokenAddress } = action.payload;

      const balanceToken = selectTokenByAddress(state, chainId, tokenAddress);
      const balance = selectUserBalanceOfToken(state, chainId, tokenAddress);

      sliceState.amount = balance;
      sliceState.formattedInput = formatBigDecimals(balance, balanceToken.decimals);
      sliceState.max = true;
    },

    setInput(
      sliceState,
      action: PayloadAction<{
        amount: string;
        chainId: string;
        tokenAddress: string;
        state: BeefyState;
      }>
    ) {
      const { state, chainId, tokenAddress } = action.payload;
      const balanceToken = selectTokenByAddress(state, chainId, tokenAddress);

      const input = action.payload.amount.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

      let value = new BigNumber(input).decimalPlaces(balanceToken.decimals, BigNumber.ROUND_DOWN);

      if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
        value = BIG_ZERO;
      }

      const balance = selectUserBalanceOfToken(state, chainId, tokenAddress);

      if (value.isGreaterThanOrEqualTo(balance)) {
        value = new BigNumber(balance);
        sliceState.max = true;
      } else {
        sliceState.max = false;
      }

      const formattedInput = (() => {
        if (value.isEqualTo(input)) return input;
        if (input === '') return '';
        if (input === '.') return `0.`;
        return formatBigNumberSignificant(value);
      })();

      sliceState.formattedInput = formattedInput;
      sliceState.amount = value;
    },

    setDestChain(
      sliceState,
      action: PayloadAction<{
        chainId: string;
        destChainId: string;
        state: BeefyState;
      }>
    ) {
      const { chainId, destChainId, state } = action.payload;

      const destChain = selectChainById(state, destChainId);

      const bridgeTokenInfo = selectBifiBridgeDataByChainId(state, chainId);

      sliceState.destChainInfo = bridgeTokenInfo.destChains[destChain.networkChainId];
      sliceState.destChain = destChainId;
    },
  },

  extraReducers: builder => {
    builder.addCase(initiateBridgeForm.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      const walletAddress = action.payload.walletAddress;
      const currentChainId = walletAddress ? state.user.wallet.selectedChainId : 'bsc';
      const isConnectedToFtm = currentChainId === 'fantom';
      sliceState.destChain = isConnectedToFtm ? 'bsc' : 'fantom';
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.max = false;
      sliceState.destChainInfo =
        state.entities.bridge.byChainId[isConnectedToFtm ? 'fantom' : currentChainId].destChains[
          isConnectedToFtm ? 56 : 250
        ];
    });
  },
});

export const bridgeModalActions = bridgeModalSlice.actions;
