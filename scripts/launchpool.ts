// To run: yarn launchpool bsc <0x12312312> CafeSwap
import { promises as fs } from 'fs';
import { addressBookToAppId, type AppChainId, getVaultsForChain } from './common/config.ts';
import { BoostAbi } from '../src/config/abi/BoostAbi.ts';
import { ERC20Abi } from '../src/config/abi/ERC20Abi.ts';
import partners from '../src/config/promos/partners.json';
import { getViemClient } from './common/viem.ts';
import { getContract, type Address, getAddress } from 'viem';

const partnersFile = './src/config/boost/partners.json';
let boostsFile = './src/config/boost/$chain.json';

async function boostParams(chain: AppChainId, boostAddress: Address) {
  const viemClient = getViemClient(chain);
  const boostContract = getContract({
    abi: BoostAbi,
    address: boostAddress,
    client: viemClient,
  });
  const [staked, reward, duration] = await Promise.all([
    boostContract.read.stakedToken(),
    boostContract.read.rewardToken(),
    boostContract.read.duration(),
  ]);

  const tokenContract = getContract({
    abi: ERC20Abi,
    address: reward,
    client: viemClient,
  });
  const [earnedToken, earnedTokenDecimals] = await Promise.all([
    tokenContract.read.symbol(),
    tokenContract.read.decimals(),
  ]);

  return {
    earnedToken,
    earnedTokenDecimals,
    staked,
    reward,
    duration,
  };
}

async function generateLaunchpool() {
  const chain = addressBookToAppId(process.argv[2]);
  const boostAddress = getAddress(process.argv[3]);
  const partner = process.argv[4];
  const partnerId = partner.toLowerCase();
  boostsFile = boostsFile.replace('$chain', chain);

  const boost = await boostParams(chain, boostAddress);
  const pools = await getVaultsForChain(chain);
  const pool = pools.find(pool => pool.earnedTokenAddress === boost.staked);
  if (!pool) {
    throw new Error(`Could not find pool for ${boost.staked}`);
  }

  const newBoost = {
    id: `moo_${pool.oracleId}-${partnerId}`,
    poolId: pool.id,
    name: `${partner}`,
    assets: pool.assets,
    tokenAddress: boost.staked,
    earnedToken: boost.earnedToken,
    earnedTokenDecimals: Number(boost.earnedTokenDecimals),
    earnedTokenAddress: boost.reward,
    earnContractAddress: boostAddress,
    earnedOracle: 'tokens',
    earnedOracleId: boost.earnedToken,
    partnership: true,
    status: 'active',
    isMooStaked: true,
    partners: [`${partnerId}`],
  };

  const boosts = JSON.parse(await fs.readFile(boostsFile, 'utf8'));
  const newBoosts = [newBoost, ...boosts];
  await fs.writeFile(boostsFile, JSON.stringify(newBoosts, null, 2));

  if (!(partnerId in partners)) {
    const subpartner = {
      [partnerId]: {
        text: '',
        website: '',
        social: {
          telegram: '',
          twitter: '',
        },
      },
    };
    const newPartners = { ...subpartner, ...partners };
    await fs.writeFile(partnersFile, JSON.stringify(newPartners, null, 2));
    console.log('\nTODO update text and links in partners.json');
  }
}

console.error('This script needs updated to support the new promos config.');
process.exit(-1);

generateLaunchpool().catch(err => {
  console.error(err);
  process.exit(-1);
});
