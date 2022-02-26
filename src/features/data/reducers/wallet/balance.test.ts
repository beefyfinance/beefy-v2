import BigNumber from 'bignumber.js';
import { fetchAllBalanceAction, FetchAllBalanceFulfilledPayload } from '../../actions/balance';
import {
  fetchAllContractDataByChainAction,
  FetchAllContractDataFulfilledPayload,
} from '../../actions/contract-data';
import { getBeefyTestingStore } from '../../utils/test-utils';
import { balanceSlice, initialBalanceState } from './balance';

describe('Balance slice tests', () => {
  it('should update state on fulfilled token balance', async () => {
    const store = await getBeefyTestingStore();
    // given we have some prior info
    const initPayload: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [],
        govVaults: [],
        standardVaults: [
          {
            id: 'banana-bnb-stars',
            pricePerFullShare: new BigNumber(5),
            balance: new BigNumber(123),
            strategy: 'test',
          },
        ],
      },
      state: store.getState(),
    };
    store.dispatch({ type: fetchAllContractDataByChainAction.fulfilled, payload: initPayload });

    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      walletAddress: '0x00ABC',
      data: {
        boosts: [],
        govVaults: [],
        tokens: [
          { tokenId: 'banana-nfty-wbnb', amount: new BigNumber(10) },
          { tokenId: 'BIFI', amount: new BigNumber(10) },
          { tokenId: 'mooApeBNB-STARS', amount: new BigNumber(10) },
        ],
      },
      state: store.getState(),
    };
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const state = balanceSlice.reducer(store.getState().user.balance, action);
    expect(state).toMatchSnapshot();

    expect(state.byAddress['0x00abc']).toBeDefined();
    expect(state.byAddress['0x00abcdef']).toBeUndefined();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byAddress['0x00abc'].tokenAmount.byChainId['bsc'].byTokenId;
    const newState = balanceSlice.reducer(state, action);
    const afterReDispatch = newState.byAddress['0x00abc'].tokenAmount.byChainId['bsc'].byTokenId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should update state on fulfilled gov boost pools', async () => {
    const store = await getBeefyTestingStore();

    // given we have some prior info
    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      walletAddress: '0x00ABC',
      data: {
        boosts: [],
        tokens: [],
        govVaults: [
          { vaultId: 'bifi-gov', rewards: new BigNumber(100), balance: new BigNumber(10) },
        ],
      },
      state: store.getState(),
    };
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const state = balanceSlice.reducer(initialBalanceState, action);
    expect(state).toMatchSnapshot();

    expect(state.byAddress['0x00abc']).toBeDefined();
    expect(state.byAddress['0x00abcdef']).toBeUndefined();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byAddress['0x00abc'].tokenAmount.byGovVaultId;
    const newState = balanceSlice.reducer(state, action);
    const afterReDispatch = newState.byAddress['0x00abc'].tokenAmount.byGovVaultId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should update state on fulfilled boost balance', async () => {
    const store = await getBeefyTestingStore();
    // given we have some prior info
    const initPayload: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [],
        govVaults: [],
        standardVaults: [
          {
            id: 'ellipsis-renbtc',
            pricePerFullShare: new BigNumber(5),
            balance: new BigNumber(123),
            strategy: 'test',
          },
          {
            id: 'belt-beltbnb',
            pricePerFullShare: new BigNumber(50),
            balance: new BigNumber(1230),
            strategy: 'test',
          },
        ],
      },
      state: store.getState(),
    };
    store.dispatch({ type: fetchAllContractDataByChainAction.fulfilled, payload: initPayload });

    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      walletAddress: '0x00ABC',
      data: {
        govVaults: [],
        tokens: [],
        boosts: [
          {
            boostId: 'moo_ellipsis-renbtc-charge',
            balance: new BigNumber(100),
            rewards: new BigNumber(10),
          },
          {
            boostId: 'moo_beltbnb-czodiac',
            balance: new BigNumber(100),
            rewards: new BigNumber(10),
          },
        ],
      },
      state: store.getState(),
    };
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const state = balanceSlice.reducer(initialBalanceState, action);
    expect(state).toMatchSnapshot();

    expect(state.byAddress['0x00abc']).toBeDefined();
    expect(state.byAddress['0x00abcdef']).toBeUndefined();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byAddress['0x00abc'].tokenAmount.byBoostId;
    const newState = balanceSlice.reducer(state, action);
    const afterReDispatch = newState.byAddress['0x00abc'].tokenAmount.byBoostId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should consider a vault as "staked" when boost balance is zero', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      state: store.getState(),
      walletAddress: '0x000000000000',
      data: {
        // we have staked in the vault
        tokens: [{ tokenId: 'mooApeBANANA-BUSD', amount: new BigNumber(1) }],
        govVaults: [],
        boosts: [
          {
            boostId: 'moo_banana-banana-busd-bitcrush',
            balance: new BigNumber(0), // but boost is empty
            rewards: new BigNumber(0),
          },
        ],
      },
    };

    // we should expect the vault to be included in the deposited list
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const newState = balanceSlice.reducer(initialBalanceState, action);
    expect(
      newState.byAddress['0x000000000000'].depositedVaultIds.includes('banana-banana-busd')
    ).toBeTruthy();
  });

  it('should consider a vault as "staked" when boost balance is zero and boost rewards is non-zero', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      state: store.getState(),
      walletAddress: '0x000000000000',
      data: {
        // we have NOT staked in the vault
        tokens: [{ tokenId: 'mooApeBANANA-BUSD', amount: new BigNumber(0) }],
        govVaults: [],
        boosts: [
          {
            boostId: 'moo_banana-banana-busd-bitcrush',
            balance: new BigNumber(0), // but boost is empty
            rewards: new BigNumber(1), // BUT we have some rewards
          },
        ],
      },
    };

    // we should expect the vault to be included in the deposited list
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const newState = balanceSlice.reducer(initialBalanceState, action);
    expect(
      newState.byAddress['0x000000000000'].depositedVaultIds.includes('banana-banana-busd')
    ).toBeTruthy();
  });

  it('should consider a vault as "staked" when the first boost balance is non-zero but last boost balance is zero', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      state: store.getState(),
      walletAddress: '0x000000000000',
      data: {
        // we have nothing in the vault
        tokens: [{ tokenId: 'mooApeBNB-STARS', amount: new BigNumber(0) }],
        govVaults: [],
        boosts: [
          {
            boostId: 'moo_banana-bnb-stars-mogul2',
            balance: new BigNumber(1), // this boost is not empty
            rewards: new BigNumber(1), // this boost is not empty
          },
          {
            boostId: 'moo_banana-bnb-stars-mogul',
            balance: new BigNumber(0), // but boost is empty
            rewards: new BigNumber(0),
          },
        ],
      },
    };

    // we should expect the vault to be included in the deposited list
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const newState = balanceSlice.reducer(initialBalanceState, action);
    expect(
      newState.byAddress['0x000000000000'].depositedVaultIds.includes('banana-bnb-stars')
    ).toBeTruthy();
  });
});
