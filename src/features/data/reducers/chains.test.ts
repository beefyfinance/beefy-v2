import {
  fetchChainConfigs,
  FulfilledPayload as FetchConfigsActionPayload,
} from '../actions/chains';
import { chainsSlice, initialChainsState } from './chains';

describe('Chains slice tests', () => {
  it('should update state on fulfilled chain config list', () => {
    const payload: FetchConfigsActionPayload = {
      chainConfigs: [
        {
          id: 'arbitrum',
          name: 'Arbitrum',
          chainId: 42161,
          rpc: ['https://arb1.arbitrum.io/rpc'],
          explorerUrl: 'https://arbiscan.io',
          multicallAddress: '0x13aD51a6664973EbD0749a7c84939d973F247921',
          supportedWallets: ['injected', 'custom-coinbase', 'custom-wallet-connect'],
          providerName: 'Arbitrum',
          walletSettings: {
            chainId: `0x${parseInt('42161', 10).toString(16)}`,
            chainName: 'Arbitrum One',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://arb1.arbitrum.io/rpc'],
            blockExplorerUrls: ['https://arbiscan.io/'],
          },
          stableCoins: ['USDC', 'USDT', 'MIM'],
        },
        {
          id: 'celo',
          name: 'Celo',
          chainId: 42220,
          rpc: ['https://forno.celo.org'],
          explorerUrl: 'https://explorer.celo.org',
          multicallAddress: '0xa9E6E271b27b20F65394914f8784B3B860dBd259',
          supportedWallets: ['injected', 'custom-wallet-connect'],
          providerName: 'Celo',
          walletSettings: {
            chainId: `0x${parseInt('42220', 10).toString(16)}`,
            chainName: 'Celo',
            nativeCurrency: {
              name: 'CELO',
              symbol: 'CELO',
              decimals: 18,
            },
            rpcUrls: ['https://forno.celo.org'],
            blockExplorerUrls: ['https://explorer.celo.org/'],
          },
          stableCoins: ['cUSD', 'cEUR', 'DAI'],
        },
      ],
    };
    const action = { type: fetchChainConfigs.fulfilled, payload: payload };
    const state = chainsSlice.reducer(initialChainsState, action);
    expect(state).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = Object.values(state.byId)[0];
    const newState = chainsSlice.reducer(state, action);
    const afterReDispatch = newState.byId[beforeReDispatch.id];
    expect(beforeReDispatch).toBe(afterReDispatch);
  });
});
