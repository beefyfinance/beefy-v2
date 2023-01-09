import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { formatBigDecimals, formatBigNumberSignificant } from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { fetchBridgeChainData, initiateBridgeForm } from '../../actions/bridge';
import { BridgeInfoEntity } from '../../apis/bridge/bridge-types';
import { ChainEntity } from '../../entities/chain';
import { selectUserBalanceOfToken } from '../../selectors/balance';
import { selectBridgeBifiDestChainData } from '../../selectors/bridge';
import { selectChainById } from '../../selectors/chains';
import { selectTokenByAddress } from '../../selectors/tokens';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { isEmpty } from '../../../../helpers/utils';

export enum FormStep {
  Preview = 1,
  Confirm,
  SelectFromNetwork,
  SelectToNetwork,
}

export interface TxStateInterface {
  error: string | null;
  swapTx: string | null;
  status: 0 | 3 | 10 | 8 | 9 | 12 | 14;
}
//FOR MORE INFO WATCH https://github.com/anyswap/CrossChain-Router/wiki/How-to-integrate-AnySwap-Router POINT 4

type statusType = 'idle' | 'loading' | 'confirming' | 'success' | 'error';

export type BridgeState = {
  step: FormStep;
  fromChainId: ChainEntity['id'];
  destChainId: ChainEntity['id'];
  max: boolean;
  amount: BigNumber;
  formattedInput: string;
  formattedOutput: string;
  bridgeDataByChainId: {
    [chainId: ChainEntity['id']]: BridgeInfoEntity;
  };
  supportedChains: ChainEntity['id'][];
  status: statusType;
  bridgeTxData: TxStateInterface;
};

const initialBridgeState: BridgeState = {
  step: FormStep.Preview,
  fromChainId: 'bsc',
  destChainId: 'fantom',
  amount: BIG_ZERO,
  formattedInput: '',
  formattedOutput: '',
  max: false,
  bridgeDataByChainId: {},
  supportedChains: [],
  status: 'idle',
  bridgeTxData: {
    error: null,
    swapTx: null,
    status: 0,
  },
};

export const bridgeSlice = createSlice({
  name: 'bridge',
  initialState: initialBridgeState,
  reducers: {
    resetForm(sliceState) {
      const bridgeData = sliceState.bridgeDataByChainId;
      const supportedChains = sliceState.supportedChains;
      if (isEmpty(bridgeData)) {
        return initialBridgeState;
      } else {
        return { ...initialBridgeState, bridgeDataByChainId: bridgeData, supportedChains };
      }
    },
    setMax(
      sliceState,
      action: PayloadAction<{
        chainId: string;
        tokenAddress: string;
        state: BeefyState;
      }>
    ) {
      const { state, chainId, tokenAddress } = action.payload;

      const balance = selectUserBalanceOfToken(state, chainId, tokenAddress);

      const destChain = selectChainById(state, sliceState.destChainId);

      const destChainData = selectBridgeBifiDestChainData(state, chainId, destChain.networkChainId);

      const formattedOutput = (() => {
        if (balance && destChainData) {
          const fee = balance
            .times(new BigNumber(destChainData.SwapFeeRatePerMillion))
            .dividedBy(100);
          let value = balance.minus(fee);
          if (fee.isLessThan(new BigNumber(destChainData.MinimumSwapFee))) {
            value = balance.minus(new BigNumber(destChainData.MinimumSwapFee));
          } else if (fee.isGreaterThan(new BigNumber(destChainData.MaximumSwapFee))) {
            value = balance.minus(new BigNumber(destChainData.MaximumSwapFee));
          }
          if (!destChainData?.swapfeeon) {
            value = balance;
          }
          if (value?.isGreaterThan(BIG_ZERO)) {
            return new BigNumber(value).toFixed(4);
          }
          return BIG_ZERO.toFixed(2);
        } else {
          return BIG_ZERO.toFixed(2);
        }
      })();

      sliceState.amount = balance;
      sliceState.formattedInput = formatBigDecimals(balance, 4);
      sliceState.formattedOutput = formattedOutput;
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

      const destChain = selectChainById(state, sliceState.destChainId);

      const destChainData = selectBridgeBifiDestChainData(state, chainId, destChain.networkChainId);

      const input = action.payload.amount.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

      let value = new BigNumber(input).decimalPlaces(balanceToken.decimals, BigNumber.ROUND_FLOOR);

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
        return formatBigNumberSignificant(value, 3);
      })();

      const formattedOutput = (() => {
        if (value && destChainData) {
          const fee = value
            .times(new BigNumber(destChainData.SwapFeeRatePerMillion))
            .dividedBy(100);
          let output = value.minus(fee);
          if (fee.isLessThan(new BigNumber(destChainData.MinimumSwapFee))) {
            output = value.minus(new BigNumber(destChainData.MinimumSwapFee));
          } else if (fee.isGreaterThan(new BigNumber(destChainData.MaximumSwapFee))) {
            output = value.minus(new BigNumber(destChainData.MaximumSwapFee));
          }
          if (!destChainData?.swapfeeon) {
            output = value;
          }
          if (value?.isGreaterThan(BIG_ZERO)) {
            return new BigNumber(output).toFixed(4);
          }
          return BIG_ZERO.toFixed(2);
        } else {
          return BIG_ZERO.toFixed(2);
        }
      })();

      sliceState.formattedInput = formattedInput;
      sliceState.formattedOutput = formattedOutput;
      sliceState.amount = value;
    },

    setFromChain(sliceState, action: PayloadAction<{ chainId: string }>) {
      const { chainId } = action.payload;

      sliceState.amount = new BigNumber(BIG_ZERO);
      sliceState.formattedInput = '';
      sliceState.formattedOutput = '';
      if (chainId === sliceState.destChainId) {
        const oldFromChain = sliceState.fromChainId;
        sliceState.fromChainId = chainId;
        sliceState.destChainId = oldFromChain;
      } else {
        sliceState.fromChainId = chainId;
      }
      sliceState.step = FormStep.Preview;
    },

    setDestChain(
      sliceState,
      action: PayloadAction<{
        destChainId: string;
      }>
    ) {
      const { destChainId } = action.payload;

      sliceState.destChainId = destChainId;
      sliceState.step = FormStep.Preview;
    },

    setStatus(sliceState, action: PayloadAction<{ status: statusType }>) {
      const { status } = action.payload;

      sliceState.status = status;
    },
    setStep(sliceState, action: PayloadAction<{ step: FormStep }>) {
      sliceState.step = action.payload.step;
    },
    setBridgeTxData(sliceState, action: PayloadAction<{ txData: TxStateInterface }>) {
      sliceState.bridgeTxData = action.payload.txData;
    },
  },

  extraReducers: builder => {
    builder.addCase(initiateBridgeForm.fulfilled, (sliceState, action) => {
      const { bridgeData, chainId, destChainId, supportedChains } = action.payload;
      sliceState.fromChainId = chainId;
      sliceState.destChainId = destChainId;
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.max = false;
      sliceState.bridgeDataByChainId[chainId] = bridgeData;
      sliceState.supportedChains = supportedChains;
    });
    builder.addCase(fetchBridgeChainData.fulfilled, (sliceState, action) => {
      const { chainId, bridgeData } = action.payload;

      sliceState.bridgeDataByChainId[chainId] = bridgeData;
    });
  },
});

export const bridgeActions = bridgeSlice.actions;
