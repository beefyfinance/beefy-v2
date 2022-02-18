// these are expensive to fetch so we do this at the last moment and memoize result

import { memoize } from 'lodash';
import { ChainEntity } from '../entities/chain';
import { TokenEntity, TokenErc20 } from '../entities/token';

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

// we want to be as close as possible from TokenErc20 for futur refactors
export type AddressBookToken = TokenErc20 & { isWrapped: boolean; isNative: boolean };

export interface ChainAddressBook {
  [tokenId: TokenEntity['id']]: AddressBookToken;
}

export const getChainAddressBook = memoize(
  async (chain: ChainEntity): Promise<ChainAddressBook> => {
    const addressBook = (await import(
      `blockchain-addressbook/build/address-book/${chain.id}/tokens/tokens`
    )) as { tokens: { [tokenId: TokenEntity['id']]: AddressBookTokenConfig } };

    const wnative = addressBook.tokens['WNATIVE'];
    const nativeSymbol = chain.walletSettings.nativeCurrency.symbol;
    // map to our own token entity
    return Object.entries(addressBook.tokens).reduce((agg, [tokenId, bookToken]) => {
      agg[tokenId] = {
        id: tokenId,
        chainId: chain.id,
        contractAddress: bookToken.address,
        decimals: bookToken.decimals,
        symbol: bookToken.symbol,
        buyUrl: null,
        website: bookToken.website || null,
        description: bookToken.description || null,
        type: 'erc20',
        isWrapped: wnative.address === bookToken.address,
        isNative: bookToken.symbol === nativeSymbol,
      };

      return agg;
    }, {} as ChainAddressBook);
  }
);
