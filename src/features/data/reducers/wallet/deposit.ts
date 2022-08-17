import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { formatBigDecimals, formatBigNumberSignificant } from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { initiateDepositForm } from '../../actions/deposit';
import { fetchEstimateZapDeposit } from '../../actions/zap';
import { TokenEntity } from '../../entities/token';
import { VaultEntity } from '../../entities/vault';
import { selectUserBalanceOfToken } from '../../selectors/balance';
import { selectTokenByAddress, selectTokenById } from '../../selectors/tokens';
import { selectVaultById } from '../../selectors/vaults';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { ZapDepositEstimate, ZapOptions } from '../../apis/zap/zap-types';

// TODO: this looks exactly like the withdraw state
export type DepositState = {
  initiated: boolean;
  vaultId: VaultEntity['id'];
  selectedToken: TokenEntity | null; // while initializing the form, this token is null
  isZap: boolean; // tell us if it's a zap that has been selected
  max: boolean; // this is so we know when to disable the max button
  amount: BigNumber;
  formattedInput: string;
  slippageTolerance: number;
  zapOptions: ZapOptions | null;
  zapEstimate: ZapDepositEstimate | null;
  zapError: string | null;
};
const initialDepositState: DepositState = {
  initiated: false,
  amount: BIG_ZERO,
  vaultId: null,
  slippageTolerance: 0.01,
  formattedInput: '',
  isZap: false,
  zapOptions: null,
  zapEstimate: null,
  zapError: null,
  max: false,
  selectedToken: null,
};

export const depositSlice = createSlice({
  name: 'deposit',
  initialState: initialDepositState,
  reducers: {
    resetForm() {
      return initialDepositState;
    },

    setZapOptions(sliceState, action: PayloadAction<ZapOptions>) {
      sliceState.zapOptions = action.payload;
    },

    setAsset(sliceState, action: PayloadAction<{ tokenId: TokenEntity['id']; state: BeefyState }>) {
      const state = action.payload.state;
      const vault = selectVaultById(state, sliceState.vaultId);
      const tokenId = action.payload.tokenId;
      const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

      const token = selectTokenById(state, vault.chainId, tokenId);
      sliceState.selectedToken = token;

      // also reset the input
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.isZap = depositToken.address !== sliceState.selectedToken.address;
      sliceState.max = false;
    },

    setMax(sliceState, action: PayloadAction<{ state: BeefyState }>) {
      const state = action.payload.state;
      const vault = selectVaultById(state, sliceState.vaultId);
      const balance = selectUserBalanceOfToken(
        state,
        vault.chainId,
        sliceState.selectedToken.address
      );
      sliceState.amount = balance;
      sliceState.formattedInput = formatBigDecimals(balance, sliceState.selectedToken.decimals);
      sliceState.max = true;
    },

    setInput(sliceState, action: PayloadAction<{ amount: string; state: BeefyState }>) {
      const state = action.payload.state;
      const vault = selectVaultById(state, sliceState.vaultId);
      const input = action.payload.amount.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

      let value = new BigNumber(input).decimalPlaces(
        sliceState.selectedToken.decimals,
        BigNumber.ROUND_DOWN
      );

      if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
        value = BIG_ZERO;
      }

      const balance = selectUserBalanceOfToken(
        state,
        vault.chainId,
        sliceState.selectedToken.address
      );
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
  },
  extraReducers: builder => {
    builder.addCase(initiateDepositForm.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      const vault = selectVaultById(state, action.payload.vaultId);
      sliceState.vaultId = vault.id;
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.initiated = true;
      sliceState.max = false;
      sliceState.zapOptions = action.payload.zapOptions;

      // select the vault oracle token by default
      const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
      sliceState.selectedToken = depositToken;

      sliceState.isZap = false;
    });

    builder.addCase(fetchEstimateZapDeposit.fulfilled, (sliceState, action) => {
      if (
        sliceState.vaultId === action.payload.vaultId &&
        sliceState.selectedToken.id === action.payload.inputTokenId &&
        sliceState.zapEstimate !== action.payload.zapEstimate
      ) {
        sliceState.zapEstimate = action.payload.zapEstimate;
        sliceState.zapError = null;
      }
    });

    builder.addCase(fetchEstimateZapDeposit.pending, (sliceState, action) => {
      if (
        sliceState.vaultId === action.meta.arg.vaultId &&
        sliceState.selectedToken.id === action.meta.arg.inputTokenId
      ) {
        // TODO clear previous error/estimate so we can show loading indicator
        // TODO component needs refactored to reduce re-renders before this can be introduced
        // sliceState.zapEstimate = null;
        // sliceState.zapError = null;
      }
    });

    builder.addCase(fetchEstimateZapDeposit.rejected, (sliceState, action) => {
      if (
        sliceState.vaultId === action.meta.arg.vaultId &&
        sliceState.selectedToken.id === action.meta.arg.inputTokenId
      ) {
        // TODO setting to null disables form
        // sliceState.zapEstimate = null;
        sliceState.zapError = action.error.message;
      }
    });
  },
});

export const depositActions = depositSlice.actions;
