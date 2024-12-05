// To run: yarn vault ethereum <0x12312312>
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';
import { promises as fs } from 'fs';

import { chainRpcs } from './common/config';
import { BeefyCowcentratedLiquidityVaultAbi } from '../src/config/abi/BeefyCowcentratedLiquidityVaultAbi';
import stratABI from '../src/config/abi/strategy.json';
import { ERC20Abi } from '../src/config/abi/ERC20Abi';
import type { AbiItem } from 'web3-utils';
//import { sortVaultKeys } from './common/vault-fields';

let vaultsFile = './src/config/vault/$chain.json';

async function vaultData(chain, vaultAddress, id) {
  const web3 = new Web3(chainRpcs[chain]);
  const abi = [...(BeefyCowcentratedLiquidityVaultAbi as unknown as AbiItem[]), ...stratABI];
  const vaultContract = new web3.eth.Contract(abi as AbiItem[], vaultAddress);
  const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);
  let calls: ShapeWithLabel[] = [
    {
      want: vaultContract.methods.want(),
      wants: vaultContract.methods.wants(),
      mooToken: vaultContract.methods.symbol(),
    },
  ];
  let [results] = await multicall.all([calls]);

  const params = {
    want: results[0].want,
    wants: [results[0].wants['0'], results[0].wants['1']],
    mooToken: results[0].mooToken,
  };

  const token0Contract = new web3.eth.Contract(ERC20Abi as unknown as AbiItem[], params.wants[0]);
  const token1Contract = new web3.eth.Contract(ERC20Abi as unknown as AbiItem[], params.wants[1]);

  calls = [
    {
      token0: token0Contract.methods.symbol(),
    },
    {
      token1: token1Contract.methods.symbol(),
    },
  ];
  [results] = await multicall.all([calls]);

  const tokens = {
    token0: results[0].token0,
    token1: results[1].token1,
  };

  let provider = params.mooToken.startsWith('cowAerodrome')
    ? 'aerodrome'
    : params.mooToken.startsWith('cowVelodrome')
    ? 'velodrome'
    : params.mooToken.startsWith('cowUniswap')
    ? 'uniswap'
    : params.mooToken.startsWith('cowRamses')
    ? 'ramses'
    : id.substring(0, id.indexOf('-'));
  let platform = provider;

  let earnedToken =
    provider === 'aerodrome'
      ? ['AERO']
      : provider === 'velodrome'
      ? ['VELOV2']
      : provider === 'nuri'
      ? ['NURI']
      : [];

  let earnedTokenAddress =
    provider === 'aerodrome'
      ? ['0x940181a94A35A4569E4529A3CDfB74e38FD98631']
      : provider === 'velodrome'
      ? ['0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db']
      : provider === 'nuri'
      ? ['0xAAAE8378809bb8815c08D3C59Eb0c7D1529aD769']
      : [];

  let type = provider === 'aerodrome' || 'velodrome' || 'nuri' ? 'pool' : 'compounds';

  return {
    ...params,
    ...tokens,
    provider,
    platform,
    earnedToken,
    earnedTokenAddress,
    type,
  };
}

async function generateVault() {
  const chain = process.argv[2];
  const clmAddress = process.argv[3];
  const rewardPoolAddress = process.argv[4];
  const vaultAddress = process.argv[5];
  const id = process.argv[6];
  vaultsFile = vaultsFile.replace('$chain', chain);

  const vault = await vaultData(chain, clmAddress, id);
  const token0 = vault.token0;
  const token1 = vault.token1;
  const symbol = token0 + '-' + token1;

  const newVault = {
    id: id + '-vault',
    name: symbol,
    type: 'standard',
    token: symbol,
    tokenAddress: clmAddress,
    tokenDecimals: 18,
    tokenProviderId: vault.provider,
    earnedToken: 'mooC' + vault.mooToken.substring(1),
    earnedTokenAddress: vaultAddress,
    earnContractAddress: vaultAddress,
    oracle: 'lps',
    oracleId: id,
    status: 'active',
    platformId: vault.provider,
    assets: [token0, token1],
    risks: ['COMPLEXITY_LOW', 'IL_HIGH', 'MCAP_LARGE', 'AUDIT', 'CONTRACTS_VERIFIED'],
    strategyTypeId: vault.type,
    network: chain,
    createdAt: Math.floor(Date.now() / 1000) + 1,
    zaps: [
      {
        strategyId: 'vault-composer',
      },
      {
        strategyId: 'reward-pool-to-vault',
      },
    ],
  };

  const newRewardPool = {
    id: id + '-rp',
    name: symbol + ' Reward Pool',
    type: 'gov',
    version: 2,
    token: vault.mooToken,
    tokenAddress: clmAddress,
    tokenDecimals: 18,
    tokenProviderId: vault.provider,
    earnedTokens: vault.earnedToken,
    earnedTokenAddresses: vault.earnedTokenAddress,
    earnedOracleIds: vault.earnedToken,
    earnedTokenDecimals: [18],
    earnedToken: 'rC' + vault.mooToken.substring(1),
    earnContractAddress: rewardPoolAddress,
    oracle: 'lps',
    oracleId: id,
    status: 'active',
    createdAt: Math.floor(Date.now() / 1000),
    platformId: vault.provider,
    assets: [token0, token1],
    risks: [],
    strategyTypeId: vault.type,
    network: chain,
    zaps: [
      {
        strategyId: 'gov-composer',
      },
      {
        strategyId: 'reward-pool-to-vault',
      },
    ],
  };

  const newClm = {
    id: id,
    name: symbol,
    token: symbol + ' ' + vault.provider,
    tokenAddress: vault.want,
    tokenDecimals: 18,
    depositTokenAddresses: [vault.wants[0], vault.wants[1]],
    tokenProviderId: vault.provider,
    earnedToken: vault.mooToken,
    earnedTokenAddress: clmAddress,
    earnContractAddress: clmAddress,
    oracle: 'lps',
    oracleId: id,
    status: 'active',
    createdAt: Math.floor(Date.now() / 1000),
    platformId: 'beefy',
    assets: [token0, token1],
    risks: ['IL_HIGH', 'MCAP_LARGE', 'CONTRACTS_VERIFIED'],
    strategyTypeId: vault.type,
    network: chain,
    type: 'cowcentrated',
    feeTier: '1',
    zaps: [
      {
        strategyId: 'cowcentrated',
      },
    ],
  };

  const vaults = JSON.parse(await fs.readFile(vaultsFile, 'utf8'));
  const newVaults =
    vaultAddress !== '0x'
      ? [newVault, newRewardPool, newClm, ...vaults]
      : [newRewardPool, newClm, ...vaults];
  await fs.writeFile(vaultsFile, JSON.stringify(newVaults, null, 2));
  console.log(`Added ${id} to ${chain} vault config`);
}

generateVault().catch(err => {
  console.error(err);
  process.exit(-1);
});
