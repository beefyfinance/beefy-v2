import { describe, expect, it } from 'vitest';
import { config } from '../../../config/config.ts';
import { fetchChainConfigs } from '../actions/chains.ts';
import { fetchAllAddressBookAction } from '../actions/tokens.ts';
import { getChainAddressBook } from '../apis/addressbook.ts';
import type { ChainConfig } from '../apis/config-types.ts';
import type { ChainId } from '../entities/chain.ts';
import { isTokenNative } from '../entities/token.ts';
import { chainsSlice, initialChainsState } from './chains.ts';
import { initialTokensState, tokensSlice } from './tokens.ts';

type Case = {
  chainId: ChainId;
  /** id the native token (address `native`) is stored under */
  nativeId: string;
  /** id the wrapped-native erc20 is stored under */
  wnativeId: string;
  wnativeAddress: string;
};

const sharedBalanceChains: Case[] = [
  {
    chainId: 'arc',
    nativeId: 'NATIVE',
    wnativeId: 'USDC',
    wnativeAddress: '0x3600000000000000000000000000000000000000',
  },
  {
    chainId: 'metis',
    nativeId: 'NATIVE',
    wnativeId: 'WMETIS',
    wnativeAddress: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
  },
  {
    chainId: 'celo',
    nativeId: 'NATIVE',
    wnativeId: 'WCELO',
    wnativeAddress: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  },
];

const separateBalanceChains: Case[] = [
  {
    chainId: 'base',
    nativeId: 'ETH',
    wnativeId: 'WETH',
    wnativeAddress: '0x4200000000000000000000000000000000000006',
  },
  {
    chainId: 'plasma',
    nativeId: 'XPL',
    wnativeId: 'WXPL',
    wnativeAddress: '0x6100E367285b01F48D07953803A2d8dCA5D19873',
  },
];

const cases = [...sharedBalanceChains, ...separateBalanceChains];
const chainIds = cases.map(({ chainId }) => chainId);
const chainConfigs: ChainConfig[] = chainIds.map(id => ({ id, ...config[id] }));

const chainsById = chainsSlice.reducer(
  initialChainsState,
  fetchChainConfigs.fulfilled({ chainConfigs, localRpcs: {} }, 'req-id', undefined)
).byId;

const addressBooks = await Promise.all(
  chainIds.map(async chainId => ({
    chainId,
    addressBook: await getChainAddressBook(chainsById[chainId]!),
  }))
);

// chain configs first: they create the native token the address book then enriches
const tokensState = tokensSlice.reducer(
  tokensSlice.reducer(
    initialTokensState,
    fetchChainConfigs.fulfilled({ chainConfigs, localRpcs: {} }, 'req-id', undefined)
  ),
  fetchAllAddressBookAction.fulfilled(addressBooks, 'req-id', undefined)
);

const bookOf = (chainId: ChainId) =>
  addressBooks.find(book => book.chainId === chainId)!.addressBook;
const stateOf = (chainId: ChainId) => tokensState.byChainId[chainId]!;

describe('real address book through the tokens reducer', () => {
  it.each(cases)(
    '$chainId stores the native token as $nativeId at address native',
    ({ chainId, nativeId }) => {
      const chainState = stateOf(chainId);

      expect(chainState.native).toBe(nativeId);
      expect(chainState.byId[nativeId]).toBe('native');
      expect(chainState.byAddress['native']).toMatchObject({
        id: nativeId,
        type: 'native',
        symbol: config[chainId].native.symbol,
      });
    }
  );

  it.each(cases)(
    '$chainId keeps the wrapped native erc20 as $wnativeId',
    ({ chainId, wnativeId, wnativeAddress }) => {
      const chainState = stateOf(chainId);
      const address = wnativeAddress.toLowerCase();

      expect(chainState.wnative).toBe(wnativeId);
      expect(chainState.byId[wnativeId]).toBe(address);
      expect(chainState.byAddress[address]).toMatchObject({ id: wnativeId, type: 'erc20' });
    }
  );

  it.each(cases)(
    '$chainId exposes exactly one native token in the address book, under $nativeId',
    ({ chainId, nativeId }) => {
      const natives = Object.entries(bookOf(chainId)).filter(([, token]) => isTokenNative(token));

      expect(natives).toHaveLength(1);
      expect(natives[0][0]).toBe(nativeId);
      expect(natives[0][1]).toMatchObject({ id: nativeId, address: 'native' });
    }
  );

  it.each(sharedBalanceChains)(
    '$chainId keeps the native symbol as the erc20 view of the shared balance',
    ({ chainId, wnativeAddress }) => {
      expect(stateOf(chainId).byId[config[chainId].native.symbol]).toBe(
        wnativeAddress.toLowerCase()
      );
    }
  );

  it.each(separateBalanceChains)(
    '$chainId keeps the native symbol on the native token',
    ({ chainId }) => {
      expect(stateOf(chainId).byId[config[chainId].native.symbol]).toBe('native');
    }
  );
});
