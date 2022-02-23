// these are expensive to fetch so we do this at the last moment and memoize result

import { memoize } from 'lodash';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';

interface AddressBookTokenConfig {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI?: string;
  website?: string;
  description?: string;
}

export interface ChainAddressBook {
  [tokenId: TokenEntity['id']]: TokenEntity;
}

export const getChainAddressBook = memoize(
  async (chain: ChainEntity): Promise<ChainAddressBook> => {
    const addressbookChain = chain.id === 'harmony' ? 'one' : chain.id;
    const addressBook = (await import(
      `blockchain-addressbook/build/address-book/${addressbookChain}/tokens/tokens`
    )) as { tokens: { [tokenId: TokenEntity['id']]: AddressBookTokenConfig } };

    const wnative = addressBook.tokens['WNATIVE'];
    const nativeSymbol = chain.walletSettings.nativeCurrency.symbol;
    // map to our own token entity
    return Object.entries(addressBook.tokens).reduce((agg, [tokenId, bookToken]) => {
      agg[tokenId] = {
        id: tokenId === 'WNATIVE' ? wnative.symbol : tokenId,
        chainId: chain.id,
        contractAddress: bookToken.address,
        decimals: bookToken.decimals,
        symbol: tokenId === nativeSymbol ? nativeSymbol : bookToken.symbol,
        buyUrl: null,
        website: bookToken.website || null,
        description: bookToken.description || null,
        type: tokenId === nativeSymbol ? 'native' : 'erc20',
      };

      return agg;
    }, {} as ChainAddressBook);
  }
);
