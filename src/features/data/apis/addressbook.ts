import { memoize } from 'lodash-es';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';

export interface ChainAddressBook {
  [tokenId: TokenEntity['id']]: TokenEntity;
}

const addressbookImporter = import('blockchain-addressbook');

export const getChainAddressBook = memoize(
  async (chain: ChainEntity): Promise<ChainAddressBook> => {
    const { addressBook } = await addressbookImporter;
    const addressbookChainId = chain.id === 'harmony' ? 'one' : chain.id;
    const addressBookChain = addressBook[addressbookChainId];
    const addressBookTokens = addressBookChain.tokens;
    const wnative = addressBookTokens['WNATIVE'];
    const nativeSymbol = addressBookChain.native.symbol;
    const nativeOracleId = addressBookChain.native.oracleId;

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
          risks: (bookToken.risks as string[]) || [],
        };
      } else if (tokenId === nativeSymbol) {
        agg[tokenId] = {
          id: tokenId,
          chainId: chain.id,
          oracleId: nativeOracleId,
          address: 'native',
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
          address: bookToken.address,
          decimals: bookToken.decimals,
          symbol: bookToken.symbol,
          buyUrl: undefined,
          website: bookToken.website || undefined,
          description: bookToken.description || undefined,
          documentation: bookToken.documentation || undefined,
          type: 'erc20',
          bridge: bookToken.bridge,
          risks: (bookToken.risks as string[]) || [],
        };
      }

      return agg;
    }, {} as ChainAddressBook);
  }
);
