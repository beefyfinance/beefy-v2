import { memoize } from 'lodash-es';
import { type ChainEntity, isChainNativeSharedWithWrapped } from '../entities/chain.ts';
import { NATIVE_TOKEN_ID, type TokenEntity } from '../entities/token.ts';

export interface ChainAddressBook {
  [tokenId: TokenEntity['id']]: TokenEntity;
}

const addressbookImporter = import('@beefyfinance/blockchain-addressbook');

export const getChainAddressBook = memoize(
  async (chain: ChainEntity): Promise<ChainAddressBook> => {
    const { addressBook } = await addressbookImporter;
    const addressbookChainId = chain.id === 'harmony' ? 'one' : chain.id;
    const addressBookChain = addressBook[addressbookChainId];
    const addressBookTokens = addressBookChain.tokens;
    const wnative = addressBookTokens['WNATIVE'];
    const native = addressBookChain.native;
    // when native and wnative are one balance, wnative keeps the symbol as its id
    const nativeId = isChainNativeSharedWithWrapped(chain) ? NATIVE_TOKEN_ID : native.symbol;

    const addrBookEntries = Object.entries(addressBookTokens);
    if (addrBookEntries.length <= 0) {
      throw new Error(`Addressbook empty for chain ${chain.id}. You may need to run "npm install"`);
    }

    const makeNativeToken = (bookToken: (typeof addressBookTokens)[string]): TokenEntity => ({
      id: nativeId,
      chainId: chain.id,
      oracleId: native.oracleId,
      address: 'native',
      decimals: native.decimals,
      symbol: native.symbol,
      name: native.name,
      buyUrl: undefined,
      website: bookToken.website || undefined,
      description: bookToken.description || undefined,
      documentation: bookToken.documentation || undefined,
      type: 'native',
      tags: (bookToken.tags as string[]) || [],
    });

    // map to our own token entity
    const book = addrBookEntries.reduce((agg, [tokenId, bookToken]) => {
      if (tokenId === 'WNATIVE') {
        agg[tokenId] = {
          id: wnative.symbol,
          chainId: chain.id,
          oracleId: wnative.oracleId,
          address: bookToken.address,
          decimals: bookToken.decimals,
          symbol: bookToken.symbol,
          name: bookToken.name,
          buyUrl: undefined,
          website: bookToken.website || undefined,
          description: bookToken.description || undefined,
          documentation: bookToken.documentation || undefined,
          type: 'erc20',
          tags: (bookToken.tags as string[]) || [],
        };
      } else if (tokenId === native.symbol && !isChainNativeSharedWithWrapped(chain)) {
        agg[tokenId] = makeNativeToken(bookToken);
      } else {
        agg[tokenId] = {
          id: tokenId,
          chainId: chain.id,
          oracleId: bookToken.oracleId,
          address: bookToken.address,
          decimals: bookToken.decimals,
          symbol: bookToken.symbol,
          name: bookToken.name,
          buyUrl: undefined,
          website: bookToken.website || undefined,
          description: bookToken.description || undefined,
          documentation: bookToken.documentation || undefined,
          type: 'erc20',
          bridge: bookToken.bridge,
          tags: (bookToken.tags as string[]) || [],
        };
      }

      return agg;
    }, {} as ChainAddressBook);

    if (isChainNativeSharedWithWrapped(chain)) {
      // the symbol-keyed entry is the erc20 view of the balance, so native gets its own entry
      book[nativeId] = makeNativeToken(addressBookTokens[native.symbol] ?? wnative);
    }

    return book;
  }
);
