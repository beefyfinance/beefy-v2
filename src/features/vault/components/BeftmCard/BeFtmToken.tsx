import { TokenErc20 } from '../../../data/entities/token';

export const beFtmMintVault = {
  mintAdress: '0x34753f36d69d00e2112Eb99B3F7f0FE76cC35090',
};

export const Ftmtoken: TokenErc20 = {
  id: 'FTM',
  chainId: 'fantom',
  contractAddress: null,
  symbol: 'FTM',
  decimals: 18,
  buyUrl: null,
  description: null,
  website: null,
  type: 'erc20',
};

export const BeFTMToken: TokenErc20 = {
  id: 'BeFTM',
  chainId: 'fantom',
  contractAddress: '0x7381eD41F6dE418DdE5e84B55590422a57917886',
  symbol: 'beFTM',
  decimals: 18,
  buyUrl: null,
  description: null,
  website: null,
  type: 'erc20',
};
