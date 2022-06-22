// To run: yarn launchpool bsc <0x12312312> CafeSwap
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';
import { promises as fs } from 'fs';

import { chainRpcs, getVaultsForChain } from './config';
import launchPoolABI from '../src/config/abi/boost.json';
import erc20ABI from '../src/config/abi/erc20.json';
import partners from '../src/config/boost/partners.json';
import { AbiItem } from 'web3-utils';

const partnersFile = './src/config/boost/partners.json';
let boostsFile = './src/config/boost/$chain.json';

async function boostParams(chain, boostAddress) {
  const web3 = new Web3(chainRpcs[chain]);
  const boostContract = new web3.eth.Contract(launchPoolABI as AbiItem[], boostAddress);
  const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);
  let calls: ShapeWithLabel[] = [
    {
      staked: boostContract.methods.stakedToken(),
      reward: boostContract.methods.rewardToken(),
      duration: boostContract.methods.duration(),
    },
  ];
  let [results] = await multicall.all([calls]);
  const params = results[0];

  const tokenContract = new web3.eth.Contract(erc20ABI as AbiItem[], params.reward);
  calls = [
    {
      earnedToken: tokenContract.methods.symbol(),
      earnedTokenDecimals: tokenContract.methods.decimals(),
    },
  ];
  [results] = await multicall.all([calls]);
  const token = results[0];

  return { ...params, ...token };
}

async function generateLaunchpool() {
  const chain = process.argv[2];
  const boostAddress = process.argv[3];
  const partner = process.argv[4];
  const partnerId = partner.toLowerCase();
  boostsFile = boostsFile.replace('$chain', chain);

  const boost = await boostParams(chain, boostAddress);
  const pools = await getVaultsForChain(chain);
  const pool = pools.find(pool => pool.earnedTokenAddress === boost.staked);

  const newBoost = {
    id: `moo_${pool.oracleId}-${partnerId}`,
    poolId: pool.id,
    name: `${partner}`,
    logo: pool.logo,
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

  if (newBoost.logo) {
    delete newBoost.assets;
  } else {
    delete newBoost.logo;
  }

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

generateLaunchpool().catch(err => {
  console.error(err);
  process.exit(-1);
});
