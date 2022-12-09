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
  documentation?: string;
  oracleId?: string;
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

    const addrBookEntries = Object.entries(addressBook.tokens);
    if (addrBookEntries.length <= 0) {
      throw new Error(
        `Addressbook empty for chain ${chain.id}. You may need to run "yarn install"`
      );
    }

    // map to our own token entity
    return addrBookEntries.reduce((agg, [tokenId, bookToken]) => {
      if (tokenId === 'WNATIVE') {
        agg[tokenId] = {
          id: wnative.symbol,
          chainId: chain.id,
          oracleId: tokenId,
          address: bookToken.address,
          decimals: bookToken.decimals,
          symbol: bookToken.symbol,
          buyUrl: null,
          website: bookToken.website || null,
          description: bookToken.description || null,
          documentation: bookToken.documentation || null,
          type: 'erc20',
        };
      } else if (tokenId === nativeSymbol) {
        // we have an addressable native token like in celo or metis
        if (bookToken.name === nativeSymbol && bookToken.address) {
          agg[tokenId] = {
            id: tokenId,
            chainId: chain.id,
            oracleId: tokenId,
            address: bookToken.address,
            decimals: bookToken.decimals,
            symbol: nativeSymbol,
            buyUrl: null,
            website: bookToken.website || null,
            description: bookToken.description || null,
            documentation: bookToken.documentation || null,
            type: 'native',
          };
        } else {
          agg[tokenId] = {
            id: tokenId,
            chainId: chain.id,
            oracleId: tokenId,
            address: 'native',
            decimals: bookToken.decimals,
            symbol: nativeSymbol,
            buyUrl: null,
            website: bookToken.website || null,
            description: bookToken.description || null,
            documentation: bookToken.documentation || null,
            type: 'native',
          };
        }
      } else {
        agg[tokenId] = {
          id: tokenId,
          chainId: chain.id,
          oracleId: bookToken.oracleId ?? tokenId,
          address: bookToken.address,
          decimals: bookToken.decimals,
          symbol: bookToken.symbol,
          buyUrl: null,
          website: bookToken.website || null,
          description: bookToken.description || null,
          documentation: bookToken.documentation || null,
          type: 'erc20',
        };
      }

      return agg;
    }, {} as ChainAddressBook);
  }
);
