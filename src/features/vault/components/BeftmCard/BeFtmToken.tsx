import { TokenErc20 } from '../../../data/entities/token';

export const beFtmMintVault = {
  mintAdress: '0x7381eD41F6dE418DdE5e84B55590422a57917886',
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
