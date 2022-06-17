// To run: yarn launchpool bsc <0x12312312> CafeSwap
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';

import { chainPools, chainRpcs } from './config';
import launchPoolABI from '../src/config/abi/boost.json';
import erc20ABI from '../src/config/abi/erc20.json';
import { AbiItem } from 'web3-utils';

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

  const boost = await boostParams(chain, boostAddress);
  const pool = chainPools[chain].find(pool => pool.earnedTokenAddress === boost.staked);

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
    partners: [''],
  };

  const subpartner = {
    text: '',
    website: '',
    social: {
      telegram: '',
      twitter: '',
    },
  };

  if (newBoost.logo) {
    delete newBoost.assets;
  } else {
    delete newBoost.logo;
  }

  let str = JSON.stringify(newBoost, null, 2) + ',';

  console.log(str);

  console.log(
    'make sure to add the partners keys linking to a valid partner in partners.json file'
  );

  console.log(JSON.stringify(subpartner, null, 2));
}

generateLaunchpool().catch(err => {
  console.error(err);
  process.exit(-1);
});
