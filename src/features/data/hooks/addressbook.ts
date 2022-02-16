import { memoize } from 'lodash';
import { useEffect, useState } from 'react';
import { ChainEntity } from '../entities/chain';
import { TokenEntity, TokenErc20 } from '../entities/token';

export interface AddressBookToken {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI?: string;
  website?: string;
  description?: string;
}

// these are expensive to fetch so we do this at the last moment and memoize result
// might be a good idea to make it as a redux action if needed at some other place
const getTokenAddressBook = memoize(
  async (
    chainId: ChainEntity['id']
  ): Promise<{
    [tokenId: TokenEntity['id']]: AddressBookToken;
  }> => {
    const addressBook = await import(
      `blockchain-addressbook/build/address-book/${chainId}/tokens/tokens`
    );
    return addressBook.tokens;
  }
);

export function useTokenAddressbookData(
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
): null | TokenErc20 {
  const [addressBook, setTokenAddressBook] = useState<null | TokenErc20>(null);

  useEffect(() => {
    (async () => {
      const tokens = await getTokenAddressBook(chainId);
      if (!(tokenId in tokens)) {
        throw new Error(`Could not find token ${tokenId} in the addressbook of ${chainId}`);
      }

      setTokenAddressBook(toTokenEntity(chainId, tokens[tokenId]));
    })();
  }, [chainId, tokenId]);

  return addressBook;
}

function toTokenEntity(chainId: ChainEntity['id'], bookToken: AddressBookToken): TokenErc20 {
  return {
    id: bookToken.symbol,
    chainId,
    contractAddress: bookToken.address,
    decimals: bookToken.decimals,
    symbol: bookToken.symbol,
    buyUrl: null,
    website: bookToken.website,
    description: bookToken.description,
    type: 'erc20',
  };
}
