// To run: yarn vault ethereum <0x12312312>
import { promises as fs } from 'fs';

import { StandardVaultAbi } from '../src/config/abi/StandardVaultAbi';

import { StratAbi } from '../src/config/abi/StrategyAbi';
import { ERC20Abi } from '../src/config/abi/ERC20Abi';
import { sortVaultKeys } from './common/vault-fields';
import { getViemClient } from './common/viem';
import { Abi, getContract } from 'viem';

let vaultsFile = './src/config/vault/$chain.json';

async function vaultData(chain, vaultAddress, id) {
  const viemClient = getViemClient(chain);
  const abi = [...StandardVaultAbi, ...StratAbi] as const satisfies Abi;

  const vaultContract = getContract({
    address: vaultAddress,
    abi,
    client: viemClient,
  });
  const [want, mooToken] = await Promise.all([
    vaultContract.read.want(),
    vaultContract.read.symbol(),
  ]);

  const tokenContract = getContract({
    address: want,
    abi: ERC20Abi,
    client: viemClient,
  });
  const [token, tokenDecimals] = await Promise.all([
    tokenContract.read.symbol(),
    tokenContract.read.decimals(),
  ]);

  let provider = mooToken.startsWith('mooCurveLend')
    ? 'curve-lend'
    : mooToken.startsWith('mooCurve') || mooToken.startsWith('mooConvex')
    ? 'curve'
    : mooToken.startsWith('mooCake')
    ? 'pancakeswap'
    : mooToken.startsWith('mooThena')
    ? 'thena'
    : mooToken.startsWith('mooSwapX')
    ? 'swapx'
    : id.substring(0, id.indexOf('-'));
  let platform = mooToken.startsWith('mooConvex')
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

  let tokenToUse = token;
  if (provider === 'pendle') {
    tokenToUse = mooToken.slice(mooToken.indexOf('-') + 1);
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
    mooToken,
    want,
    token: tokenToUse,
    tokenDecimals,
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
