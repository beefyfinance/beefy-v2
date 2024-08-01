// To run: yarn vault ethereum <0x12312312>
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';
import { promises as fs } from 'fs';

import { chainRpcs } from './common/config';
import { StandardVaultAbi } from '../src/config/abi/StandardVaultAbi';
import stratABI from '../src/config/abi/strategy.json';
import { ERC20Abi } from '../src/config/abi/ERC20Abi';
import type { AbiItem } from 'web3-utils';
import { sortVaultKeys } from './common/vault-fields';

let vaultsFile = './src/config/vault/$chain.json';

async function vaultData(chain, vaultAddress, id) {
  const web3 = new Web3(chainRpcs[chain]);
  const abi = [...(StandardVaultAbi as unknown as AbiItem[]), ...stratABI];
  const vaultContract = new web3.eth.Contract(abi as AbiItem[], vaultAddress);
  const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);
  let calls: ShapeWithLabel[] = [
    {
      want: vaultContract.methods.want(),
      mooToken: vaultContract.methods.symbol(),
    },
  ];
  let [results] = await multicall.all([calls]);
  const params = results[0];

  const tokenContract = new web3.eth.Contract(ERC20Abi as unknown as AbiItem[], params.want);
  calls = [
    {
      token: tokenContract.methods.symbol(),
      tokenDecimals: tokenContract.methods.decimals(),
    },
  ];
  [results] = await multicall.all([calls]);
  const token = results[0];

  let provider = params.mooToken.startsWith('mooCurveLend')
    ? 'curve-lend'
    : params.mooToken.startsWith('mooCurve') || params.mooToken.startsWith('mooConvex')
    ? 'curve'
    : params.mooToken.startsWith('mooCake')
    ? 'pancakeswap'
    : params.mooToken.startsWith('mooThena')
    ? 'thena'
    : id.substring(0, id.indexOf('-'));
  let platform = params.mooToken.startsWith('mooConvex') ? 'convex' : provider;
  if (provider === 'pendle') platform = 'magpie';
  if (platform === 'equilibria') provider = 'pendle';
  const migrationIds =
    ['curve', 'curve-lend'].includes(provider) && chain === 'ethereum'
      ? ['ethereum-convex']
      : ['curve', 'curve-lend'].includes(provider)
      ? ['l2-convex', 'l2-curve']
      : ['pendle'].includes(provider)
      ? ['magpie']
      : [];

  let addLiquidityUrl =
    provider === 'pendle'
      ? `https://app.pendle.finance/trade/pools/${params.want}/zap/in?chain=${chain}`
      : 'XXX';
  let removeLiquidityUrl =
    provider === 'pendle'
      ? `https://app.pendle.finance/trade/pools/${params.want}/zap/out?chain=${chain}`
      : 'XXX';

  return {
    ...params,
    ...token,
    provider,
    platform,
    migrationIds,
    addLiquidityUrl,
    removeLiquidityUrl,
  };
}

async function generateVault() {
  const chain = process.argv[2];
  const vaultAddress = process.argv[3];
  const id = process.argv[4];
  vaultsFile = vaultsFile.replace('$chain', chain);

  const vault = await vaultData(chain, vaultAddress, id);

  const newVault = sortVaultKeys({
    id: id,
    name: vault.token,
    token: vault.token,
    tokenAddress: vault.want,
    tokenDecimals: Number(vault.tokenDecimals),
    tokenProviderId: vault.provider,
    earnedToken: vault.mooToken,
    earnedTokenAddress: vaultAddress,
    earnContractAddress: vaultAddress,
    oracle: 'lps',
    oracleId: id,
    status: 'active',
    platformId: vault.platform,
    assets: [vault.token],
    migrationIds: vault.migrationIds,
    strategyTypeId: 'multi-lp',
    risks: ['COMPLEXITY_LOW', 'IL_NONE', 'MCAP_MEDIUM', 'AUDIT', 'CONTRACTS_VERIFIED'],
    addLiquidityUrl: vault.addLiquidityUrl,
    removeLiquidityUrl: vault.removeLiquidityUrl,
    network: chain,
    createdAt: Math.floor(Date.now() / 1000),
  });

  const vaults = JSON.parse(await fs.readFile(vaultsFile, 'utf8'));
  const newBoosts = [newVault, ...vaults];
  await fs.writeFile(vaultsFile, JSON.stringify(newBoosts, null, 2));
}

generateVault().catch(err => {
  console.error(err);
  process.exit(-1);
});
