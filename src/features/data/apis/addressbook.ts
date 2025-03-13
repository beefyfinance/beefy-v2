import { memoize } from 'lodash-es';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';

interface AddressBookTokenConfig {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  oracleId: string;
  decimals: number;
  logoURI?: string;
  website?: string;
  description?: string;
  documentation?: string;
  bridge?: string;
  risks: string[];
}

export interface ChainAddressBook {
  [tokenId: TokenEntity['id']]: TokenEntity;
}

const addressbookImporter = import('blockchain-addressbook');

export const getChainAddressBook = memoize(
  async (chain: ChainEntity): Promise<ChainAddressBook> => {
    const { addressBook } = await addressbookImporter;
    const addressbookChain = chain.id === 'harmony' ? 'one' : chain.id;
    const addressBookTokens = addressBook[addressbookChain].tokens as {
      [tokenId: TokenEntity['id']]: AddressBookTokenConfig;
    };
    const wnative = addressBookTokens['WNATIVE'];
    const nativeSymbol = chain.native.symbol;

    const addrBookEntries = Object.entries(addressBookTokens);
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
          oracleId: wnative.oracleId,
          address: bookToken.address,
          decimals: bookToken.decimals,
          symbol: bookToken.symbol,
          buyUrl: undefined,
          website: bookToken.website || undefined,
          description: bookToken.description || undefined,
          documentation: bookToken.documentation || undefined,
          type: 'erc20',
          risks: bookToken.risks || [],
        };
      } else if (tokenId === nativeSymbol) {
        // we have an addressable native token like in celo or metis
        if (bookToken.name === nativeSymbol && bookToken.address) {
          agg[tokenId] = {
            id: tokenId,
            chainId: chain.id,
            oracleId: bookToken.oracleId,
            address: bookToken.address,
            decimals: bookToken.decimals,
            symbol: nativeSymbol,
            buyUrl: undefined,
            website: bookToken.website || undefined,
            description: bookToken.description || undefined,
            documentation: bookToken.documentation || undefined,
            type: 'native',
          };
        } else {
          agg[tokenId] = {
            id: tokenId,
            chainId: chain.id,
            oracleId: bookToken.oracleId,
            address: 'native',
            decimals: bookToken.decimals,
            symbol: nativeSymbol,
            buyUrl: undefined,
            website: bookToken.website || undefined,
            description: bookToken.description || undefined,
            documentation: bookToken.documentation || undefined,
            type: 'native',
          };
        }
      } else {
        agg[tokenId] = {
          id: tokenId,
          chainId: chain.id,
          oracleId: bookToken.oracleId,
          address: bookToken.address,
          decimals: bookToken.decimals,
          symbol: bookToken.symbol,
          buyUrl: undefined,
          website: bookToken.website || undefined,
          description: bookToken.description || undefined,
          documentation: bookToken.documentation || undefined,
          type: 'erc20',
          bridge: bookToken.bridge,
          risks: bookToken.risks || [],
        };
      }

      return agg;
    }, {} as ChainAddressBook);
  }
);
