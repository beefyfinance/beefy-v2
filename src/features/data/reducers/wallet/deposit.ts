import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BIG_ZERO, formatBigDecimals } from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { initiateDepositForm } from '../../actions/deposit';
import { fetchEstimateZapDeposit } from '../../actions/zap';
import { ZapEstimate, ZapOptions } from '../../apis/zap';
import { TokenEntity } from '../../entities/token';
import { VaultEntity } from '../../entities/vault';
import { selectWalletBalanceOfToken } from '../../selectors/balance';
import { selectTokenById } from '../../selectors/tokens';
import { selectVaultById } from '../../selectors/vaults';

// TODO: this looks exactly like the withdraw state
export type DepositState = {
  initiated: boolean;
  vaultId: VaultEntity['id'];
  selectedToken: TokenEntity;
  isZap: boolean; // tell us if it's a zap that has been selected
  max: boolean; // this is so we know when to disable the max button
  amount: BigNumber;
  formattedInput: string;
  slippageTolerance: number;
  zapOptions: ZapOptions | null;
  zapEstimate: ZapEstimate | null;
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
  max: false,
  selectedToken: null,
};

export const depositSlice = createSlice({
  name: 'deposit',
  initialState: initialDepositState,
  reducers: {
    setAsset(sliceState, action: PayloadAction<{ tokenId: TokenEntity['id']; state: BeefyState }>) {
      const state = action.payload.state;
      const vault = selectVaultById(state, sliceState.vaultId);
      const tokenId = action.payload.tokenId;

      const token =
        vault.oracleId === tokenId
          ? selectTokenById(state, vault.chainId, tokenId)
          : selectTokenById(state, vault.chainId, tokenId);
      sliceState.selectedToken = token;

      // also reset the input
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.isZap = vault.oracleId !== sliceState.selectedToken.id;
      sliceState.max = false;
    },

    setMax(sliceState, action: PayloadAction<{ state: BeefyState }>) {
      const state = action.payload.state;
      const vault = selectVaultById(state, sliceState.vaultId);
      const balance = selectWalletBalanceOfToken(state, vault.chainId, sliceState.selectedToken.id);
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

      const balance = selectWalletBalanceOfToken(state, vault.chainId, sliceState.selectedToken.id);
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
        return (value as any).significant(6);
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
      const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
      sliceState.selectedToken = oracleToken;

      sliceState.isZap = sliceState.selectedToken.id !== vault.oracleId;
    });

    builder.addCase(fetchEstimateZapDeposit.fulfilled, (sliceState, action) => {
      if (
        sliceState.vaultId === action.payload.vaultId &&
        sliceState.selectedToken.id === action.payload.inputTokenId &&
        sliceState.zapEstimate !== action.payload.zapEstimate
      ) {
        sliceState.zapEstimate = action.payload.zapEstimate;
      }
    });
  },
});

export const depositActions = depositSlice.actions;
