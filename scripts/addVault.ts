// To run: yarn vault ethereum <0x12312312>
import { StandardVaultAbi } from '../src/config/abi/StandardVaultAbi.ts';
import { StratAbi } from '../src/config/abi/StrategyAbi.ts';
import { ERC20Abi } from '../src/config/abi/ERC20Abi.ts';
import { sortVaultKeys } from './common/vault-fields.ts';
import { getViemClient } from './common/viem.ts';
import { type Abi, type Address, getAddress, getContract } from 'viem';
import type { VaultConfig } from '../src/features/data/apis/config-types.ts';
import { addressBookToAppId, type AppChainId } from './common/config.ts';
import { loadJson, saveJson } from './common/files.ts';

let vaultsFile = './src/config/vault/$chain.json';

type VaultParams = {
  want: string;
  mooToken: string;
};

type TokenParams = {
  token: string;
  tokenDecimals: number;
};

type VaultData = VaultParams &
  TokenParams & { provider: string; platform: string; points: string[] } & Pick<
  VaultConfig,
  'migrationIds' | 'oracleId' | 'addLiquidityUrl' | 'removeLiquidityUrl'
>;

async function vaultData(chain: AppChainId, vaultAddress: Address, id: string): Promise<VaultData> {
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

  const addLiquidityUrl =
    provider === 'pendle'
      ? `https://app.pendle.finance/trade/pools/${want}/zap/in?chain=${chain}`
      : provider === 'swapx'
        ? 'https://swapx.fi/earn'
        : 'XXX';
  const removeLiquidityUrl =
    provider === 'pendle'
      ? `https://app.pendle.finance/trade/pools/${want}/zap/out?chain=${chain}`
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
  const chain = addressBookToAppId(process.argv[2]);
  const vaultAddress = getAddress(process.argv[3]);
  const id = process.argv[4];
  vaultsFile = vaultsFile.replace('$chain', chain);

  const data = await vaultData(chain, vaultAddress, id);
  const vault: VaultConfig = {
    id: id,
    name: data.token,
    type: 'standard' as const,
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
  const vaults = await loadJson<VaultConfig[]>(vaultsFile);
  const newVaults = [newVault, ...vaults];
  await saveJson(vaultsFile, newVaults, 'prettier');
}

generateVault().catch(err => {
  console.error(err);
  process.exit(-1);
});
