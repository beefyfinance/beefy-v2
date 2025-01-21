// To run: yarn clm ethereum 0xclm 0xpool 0xvault clm-id
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';
import { chainRpcs } from './common/config';
import { BeefyCowcentratedLiquidityVaultAbi } from '../src/config/abi/BeefyCowcentratedLiquidityVaultAbi';
import stratABI from '../src/config/abi/strategy.json';
import { ERC20Abi } from '../src/config/abi/ERC20Abi';
import type { AbiItem } from 'web3-utils';
import { sortVaultKeys } from './common/vault-fields';
import { isValidChecksumAddress } from './common/utils';
import { join as pathJoin } from 'node:path';
import type { VaultConfig } from '../src/features/data/apis/config-types';
import { loadJson, saveJson } from './common/files';

// Which platforms **only** send fee rewards to the reward pool
// i.e. strategies that do not call pool.collect()
// Do not add ramses/shadow/nuri etc here as the protocol fees can be set 0-100%
const poolPlatforms = ['aerodrome', 'velodrome'];

async function vaultData(chain: string, vaultAddress: string, id: string) {
  const web3 = new Web3(chainRpcs[chain]);
  const abi = [...(BeefyCowcentratedLiquidityVaultAbi as unknown as AbiItem[]), ...stratABI];
  const vaultContract = new web3.eth.Contract(abi as AbiItem[], vaultAddress);
  const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);
  const vaultCalls: ShapeWithLabel[] = [
    {
      want: vaultContract.methods.want(),
      wants: vaultContract.methods.wants(),
      mooToken: vaultContract.methods.symbol(),
    },
  ];
  const [vaultResults] = await multicall.all([vaultCalls]);

  const params = {
    want: vaultResults[0].want,
    wants: [vaultResults[0].wants['0'], vaultResults[0].wants['1']],
    mooToken: vaultResults[0].mooToken,
  };

  const token0Contract = new web3.eth.Contract(ERC20Abi as unknown as AbiItem[], params.wants[0]);
  const token1Contract = new web3.eth.Contract(ERC20Abi as unknown as AbiItem[], params.wants[1]);

  const tokenCalls: ShapeWithLabel[] = [
    {
      token0: token0Contract.methods.symbol(),
    },
    {
      token1: token1Contract.methods.symbol(),
    },
  ];
  const [tokenResults] = await multicall.all([tokenCalls]);

  const tokens = {
    token0: tokenResults[0].token0,
    token1: tokenResults[1].token1,
  };

  const provider = params.mooToken.startsWith('cowAerodrome')
    ? 'aerodrome'
    : params.mooToken.startsWith('cowVelodrome')
    ? 'velodrome'
    : params.mooToken.startsWith('cowUniswap')
    ? 'uniswap'
    : params.mooToken.startsWith('cowRamses')
    ? 'ramses'
    : id.substring(0, id.indexOf('-'));
  const platform = provider;

  const earnedToken =
    provider === 'aerodrome'
      ? ['AERO']
      : provider === 'velodrome'
      ? ['VELOV2']
      : provider === 'nuri'
      ? ['NURI']
      : [];

  const earnedTokenAddress =
    provider === 'aerodrome'
      ? ['0x940181a94A35A4569E4529A3CDfB74e38FD98631']
      : provider === 'velodrome'
      ? ['0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db']
      : provider === 'nuri'
      ? ['0xAAAE8378809bb8815c08D3C59Eb0c7D1529aD769']
      : [];

  const strategyTypeId = poolPlatforms.includes(provider) ? 'pool' : 'compounds';

  return {
    ...params,
    ...tokens,
    provider,
    platform,
    earnedToken,
    earnedTokenAddress,
    strategyTypeId,
  };
}

const orThrow = <T>(v: T | false | null | undefined, msg: string) => {
  if (!v) {
    throw new Error(msg);
  }
  return v;
};

const requireChain = (chain: string) =>
  orThrow(chain in chainRpcs && chain, `Unknown chain "${chain}"`);
const requireAddress = (address: string) =>
  orThrow(
    address !== '0x' && isValidChecksumAddress(address) && address,
    `Invalid address "${address}"`
  );
const maybeAddress = (address: string) => (isValidChecksumAddress(address) ? address : '0x');
const requireString = (str: string) => orThrow(str, 'Missing string');

async function generateVault() {
  const chain = requireChain(process.argv[2]);
  const clmAddress = requireAddress(process.argv[3]);
  const rewardPoolAddress = requireAddress(process.argv[4]);
  const vaultAddress = maybeAddress(process.argv[5]);
  const id = requireString(process.argv[6]);
  const vaultsFile = pathJoin(__dirname, '..', `src/config/vault/${chain}.json`);
  const createdAt = Math.trunc(Date.now() / 1000);

  const vault = await vaultData(chain, clmAddress, id);
  const token0 = vault.token0;
  const token1 = vault.token1;
  const symbol = token0 + '-' + token1;

  const newVault: VaultConfig | undefined =
    vaultAddress === '0x'
      ? undefined
      : {
          id: id + '-vault',
          name: symbol,
          type: 'standard' as const,
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
          strategyTypeId: vault.strategyTypeId,
          network: chain,
          createdAt: createdAt + 1,
          zaps: [
            {
              strategyId: 'vault-composer' as const,
            },
            {
              strategyId: 'reward-pool-to-vault' as const,
            },
          ],
        };

  const newRewardPool: VaultConfig = {
    id: id + '-rp',
    name: symbol + ' Reward Pool',
    type: 'gov' as const,
    version: 2,
    token: vault.mooToken,
    tokenAddress: clmAddress,
    tokenDecimals: 18,
    tokenProviderId: vault.provider,
    earnedTokenAddresses: vault.earnedTokenAddress,
    earnedTokenDecimals: 18,
    earnedToken: 'rC' + vault.mooToken.substring(1),
    earnContractAddress: rewardPoolAddress,
    oracle: 'lps',
    oracleId: id,
    status: 'active',
    createdAt,
    platformId: vault.provider,
    assets: [token0, token1],
    risks: [],
    strategyTypeId: vault.strategyTypeId,
    network: chain,
    zaps: [
      {
        strategyId: 'gov-composer' as const,
      },
    ],
  };
  if (newVault) {
    newRewardPool.zaps?.push({
      strategyId: 'reward-pool-to-vault' as const,
    });
  }

  const newClm: VaultConfig = {
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
    createdAt,
    platformId: 'beefy',
    assets: [token0, token1],
    risks: ['IL_HIGH', 'MCAP_LARGE', 'CONTRACTS_VERIFIED'],
    strategyTypeId: vault.strategyTypeId,
    network: chain,
    type: 'cowcentrated' as const,
    feeTier: '1',
    zaps: [
      {
        strategyId: 'cowcentrated' as const,
      },
    ],
  };

  const vaultsToAdd = (newVault ? [newVault, newRewardPool, newClm] : [newRewardPool, newClm]).map(
    sortVaultKeys
  );
  const vaults = await loadJson<VaultConfig[]>(vaultsFile);
  const newVaults = [...vaultsToAdd, ...vaults];
  await saveJson(vaultsFile, newVaults, 'prettier');
  console.log(`Added ${id} to ${chain} vault config`);
}

generateVault().catch(err => {
  console.error(err);
  process.exit(-1);
});
