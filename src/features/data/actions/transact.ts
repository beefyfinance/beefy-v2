import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { VaultEntity } from '../entities/vault';
import { selectVaultById } from '../selectors/vaults';
import { selectShouldInitAddressBook } from '../selectors/data-loader';
import { fetchAddressBookAction } from './tokens';
import { sleep } from '../utils/async-utils';
import { isInitialLoader } from '../reducers/data-loader-types';
import { fetchAllZapsAction } from './zap';
import { getTransactApi } from '../apis/instances';
import { TransactMode } from '../reducers/wallet/transact';
import {
  selectTransactOptionsForTokensId,
  selectTransactOptionsMode,
  selectTransactOptionsVaultId,
  selectTransactVaultId,
} from '../selectors/transact';
import BigNumber from 'bignumber.js';
import { ChainEntity } from '../entities/chain';
import { TransactOption, TransactQuote } from '../apis/transact/transact-types';

export type TransactInitArgs = {
  vaultId: VaultEntity['id'];
};

export type TransactInitPayload = {};

export const transactInit = createAsyncThunk<
  TransactInitPayload,
  TransactInitArgs,
  { state: BeefyState }
>(
  'transact/init',
  async ({ vaultId }, { getState, dispatch }) => {
    const vault = selectVaultById(getState(), vaultId);

    if (selectShouldInitAddressBook(getState(), vault.chainId)) {
      await dispatch(fetchAddressBookAction({ chainId: vault.chainId }));
    }

    const zapsLoader = getState().ui.dataLoader.global.zaps;
    if (zapsLoader && isInitialLoader(zapsLoader)) {
      await dispatch(fetchAllZapsAction());
    }

    // TODO remove
    await sleep(1000);
  },
  {
    condition({ vaultId }, { getState }) {
      // only dispatch if needed
      return selectTransactVaultId(getState()) !== vaultId;
    },
  }
);

export type TransactFetchDepositOptionsArgs = {
  vaultId: VaultEntity['id'];
};

export type TransactFetchDepositOptionsPayload = {
  options: TransactOption[];
};

export const transactFetchDepositOptions = createAsyncThunk<
  TransactFetchDepositOptionsPayload,
  TransactFetchDepositOptionsArgs,
  { state: BeefyState }
>(
  'transact/fetchDepositOptions',
  async ({ vaultId }, { getState }) => {
    const api = await getTransactApi();
    const state = getState();
    const options = await api.getDepositOptionsFor(vaultId, state);

    return {
      options: options,
    };
  },
  {
    condition({ vaultId }, { getState }) {
      const state = getState();

      return (
        selectTransactOptionsMode(state) !== TransactMode.Deposit ||
        selectTransactVaultId(state) !== selectTransactOptionsVaultId(state)
      );
    },
  }
);

export type TransactFetchDepositQuotesPayload = {
  quotes: TransactQuote[];
};

export type TransactFetchDepositQuotesArgs = {
  inputAmount: BigNumber;
  chainId: ChainEntity['id'];
  tokensId: TransactOption['tokensId'];
};

export const transactFetchDepositQuotes = createAsyncThunk<
  TransactFetchDepositQuotesPayload,
  TransactFetchDepositQuotesArgs,
  { state: BeefyState }
>('transact/fetchDepositQuotes', async ({ inputAmount, chainId, tokensId }, { getState }) => {
  const api = await getTransactApi();
  const state = getState();
  const options = selectTransactOptionsForTokensId(state, tokensId);
  const quotes = await api.getDepositQuotesFor(options, inputAmount);

  return {
    quotes,
  };
});
