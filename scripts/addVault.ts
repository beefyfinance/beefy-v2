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
    : params.mooToken.startsWith('mooSwapX')
    ? 'swapx'
    : id.substring(0, id.indexOf('-'));
  let platform = params.mooToken.startsWith('mooConvex')
    ? 'convex'
    : provider === 'swapx'
    ? 'ichi'
    : provider;
  if (provider === 'pendle') {
    platform = 'magpie';
    if (id.startsWith('pendle-eqb')) platform = 'equilibria';
  }
  if (platform === 'equilibria') provider = 'pendle';
  const migrationIds =
    ['curve', 'curve-lend'].includes(provider) && chain === 'ethereum'
      ? ['ethereum-convex', 'ethereum-curve']
      : ['curve', 'curve-lend'].includes(provider)
      ? ['l2-convex', 'l2-curve']
      : ['pendle'].includes(provider)
      ? ['magpie']
      : provider === 'swapx'
      ? ['sonic-swapx']
      : [];

  if (provider === 'pendle') {
    token.token = params.mooToken.slice(params.mooToken.indexOf('-') + 1);
  }
  let oracleId = id;
  if (id.startsWith('pendle-eqb')) oracleId = id.replace('pendle-eqb', 'pendle');

  let addLiquidityUrl =
    provider === 'pendle'
      ? `https://app.pendle.finance/trade/pools/${params.want}/zap/in?chain=${chain}`
      : provider === 'swapx'
      ? 'https://swapx.fi/earn'
      : 'XXX';
  let removeLiquidityUrl =
    provider === 'pendle'
      ? `https://app.pendle.finance/trade/pools/${params.want}/zap/out?chain=${chain}`
      : provider === 'swapx'
      ? 'https://swapx.fi/earn?ownerType=my-positions&filter=my-lp'
      : 'XXX';

  const points = provider === 'pearl' ? ['pearl'] : chain === 'sonic' ? ['sonic-points'] : [];

  return {
    ...params,
    ...token,
    provider,
    platform,
    migrationIds,
    oracleId,
    addLiquidityUrl,
    removeLiquidityUrl,
    points,
  };
}

async function generateVault() {
  const chain = process.argv[2];
  const vaultAddress = process.argv[3];
  const id = process.argv[4];
  vaultsFile = vaultsFile.replace('$chain', chain);

  const data = await vaultData(chain, vaultAddress, id);
  const vault: any = {
    id: id,
    name: data.token,
    token: data.token,
    tokenAddress: data.want,
    tokenDecimals: Number(data.tokenDecimals),
    tokenProviderId: data.provider,
    earnedToken: data.mooToken,
    earnedTokenAddress: vaultAddress,
    earnContractAddress: vaultAddress,
    oracle: 'lps',
    oracleId: data.oracleId,
    status: 'active',
    platformId: data.platform,
    assets: [data.token],
    migrationIds: data.migrationIds,
    strategyTypeId: 'multi-lp',
    risks: ['COMPLEXITY_LOW', 'IL_NONE', 'MCAP_MEDIUM', 'AUDIT', 'CONTRACTS_VERIFIED'],
    addLiquidityUrl: data.addLiquidityUrl,
    removeLiquidityUrl: data.removeLiquidityUrl,
    network: chain,
    createdAt: Math.floor(Date.now() / 1000),
  };

  if (data.points?.length > 0) vault.pointStructureIds = data.points;

  const newVault = sortVaultKeys(vault);
  const vaults = JSON.parse(await fs.readFile(vaultsFile, 'utf8'));
  const newBoosts = [newVault, ...vaults];
  await fs.writeFile(vaultsFile, JSON.stringify(newBoosts, null, 2));
}

generateVault().catch(err => {
  console.error(err);
  process.exit(-1);
});
