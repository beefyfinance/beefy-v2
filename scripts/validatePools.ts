import { MultiCall } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

import { isEmpty, isValidChecksumAddress, maybeChecksumAddress } from './utils';
import { chainPools, chainRpcs } from './config';
import strategyABI from '../src/config/abi/strategy.json';
import vaultABI from '../src/config/abi/vault.json';

const overrides = {
  'bunny-bunny-eol': { keeper: undefined, stratOwner: undefined },
  'blizzard-xblzd-bnb-old-eol': { keeper: undefined },
  'blizzard-xblzd-busd-old-eol': { keeper: undefined },
  'heco-bifi-maxi': { beefyFeeRecipient: undefined }, // 0x0
  'polygon-bifi-maxi': { beefyFeeRecipient: undefined }, // 0x0
  'avax-bifi-maxi': { beefyFeeRecipient: undefined }, // 0x0
  'bifi-maxi': { stratOwner: undefined }, // harvester 0xDe30
  'beltv2-4belt': { vaultOwner: undefined }, // moonpot deployer
  'cronos-bifi-maxi': { beefyFeeRecipient: undefined }, // 0x0
  'metis-bifi-maxi': { beefyFeeRecipient: undefined }, // 0x0
  'aurora-bifi-maxi': { beefyFeeRecipient: undefined }, // 0x0
  'fuse-bifi-maxi': { beefyFeeRecipient: undefined }, // 0x0
  'moonbeam-bifi-maxi': { beefyFeeRecipient: undefined }, // 0x0
  'scream-frax': { vaultOwner: undefined }, // Rescue
};

const oldValidOwners = [
  addressBook.fantom.platforms.beefyfinance.devMultisig,
  addressBook.polygon.platforms.beefyfinance.devMultisig,
  addressBook.arbitrum.platforms.beefyfinance.devMultisig,
];

const oldValidFeeRecipients = {};

const addressFields = ['tokenAddress', 'earnedTokenAddress', 'earnContractAddress'];

const allowedEarnSameToken = new Set(['venus-wbnb']);

// Outputs alphabetical list of platforms per chain (useful to make sure they are consistently named)
const outputPlatformSummary = process.argv.includes('--platform-summary');

const validatePools = async () => {
  let exitCode = 0;

  let updates = {};

  const uniquePoolId = new Set();

  let promises = [];
  for (let [chain, pools] of Object.entries(chainPools)) {
    promises.push(validateSingleChain(chain, pools, uniquePoolId));
  }
  let results = await Promise.all(promises);

  exitCode = results.reduce((acum, cur) => (acum + cur.exitCode > 0 ? 1 : 0), 0);
  results.forEach(res => {
    if (!isEmpty(res.updates)) {
      updates[res.chain] = res.updates;
    }
  });
  // Helpful data structures to correct addresses.
  console.log('Required updates.', JSON.stringify(updates));

  return exitCode;
};

const validateSingleChain = async (chain, pools, uniquePoolId) => {
  console.log(`Validating ${pools.length} pools in ${chain}...`);

  let updates: Record<string, Record<string, any>> = {};
  let exitCode = 0;
  //Governance pools should be separately verified
  pools = pools.filter(pool => !pool.isGovVault);

  const uniqueEarnedToken = new Set();
  const uniqueEarnedTokenAddress = new Set();
  const uniqueOracleId = new Set();
  const platformCounts = {};
  let activePools = 0;

  // Populate some extra data.
  const web3 = new Web3(chainRpcs[chain]);
  pools = await populateVaultsData(chain, pools, web3);
  pools = await populateStrategyData(chain, pools, web3);

  pools = override(pools);
  pools.forEach(pool => {
    // Errors, should not proceed with build
    if (uniquePoolId.has(pool.id)) {
      console.error(`Error: ${pool.id} : Pool id duplicated: ${pool.id}`);
      exitCode = 1;
    }

    if (uniqueEarnedToken.has(pool.earnedToken) && !allowedEarnSameToken.has(pool.id)) {
      console.error(`Error: ${pool.id} : Pool earnedToken duplicated: ${pool.earnedToken}`);
      exitCode = 1;
    }

    if (
      uniqueEarnedTokenAddress.has(pool.earnedTokenAddress) &&
      !allowedEarnSameToken.has(pool.id)
    ) {
      console.error(
        `Error: ${pool.id} : Pool earnedTokenAddress duplicated: ${pool.earnedTokenAddress}`
      );
      exitCode = 1;
    }

    if (pool.earnedTokenAddress !== pool.earnContractAddress) {
      console.error(
        `Error: ${pool.id} : Pool earnedTokenAddress not same as earnContractAddress: ${pool.earnedTokenAddress} != ${pool.earnContractAddress}`
      );
      exitCode = 1;
    }

    if (!pool.platformId) {
      console.error(`Error: ${pool.id} : Pool platformId missing vault platform`);
      exitCode = 1;
    }

    if (pool.oracle === 'lps' && !pool.tokenProviderId) {
      console.error(`Error: ${pool.id} : tokenProviderId missing LP provider platform`);
      exitCode = 1;
    }

    if (!pool.createdAt) {
      console.error(
        `Error: ${pool.id} : Pool createdAt timestamp missing - required for UI: vault sorting`
      );
      exitCode = 1;
    } else if (isNaN(pool.createdAt)) {
      console.error(`Error: ${pool.id} : Pool createdAt timestamp wrong type, should be a number`);
      exitCode = 1;
    }

    addressFields.forEach(field => {
      if (pool.hasOwnProperty(field) && !isValidChecksumAddress(pool[field])) {
        const maybeValid = maybeChecksumAddress(pool[field]);
        console.error(
          `Error: ${pool.id} : ${field} requires checksum - ${
            maybeValid ? `\n\t${field}: '${maybeValid}',` : 'it is invalid'
          }`
        );
        exitCode = 1;
      }
    });

    if (pool.status === 'active') {
      activePools++;
    }

    if (new BigNumber(pool.totalSupply).isZero()) {
      if (pool.status !== 'eol') {
        console.error(`Error: ${pool.id} : Pool is empty`);
        exitCode = 1;
        if (!('emptyVault' in updates)) updates['emptyVault'] = {};
        updates.emptyVault[pool.id] = pool.earnContractAddress;
      } else {
        console.warn(`${pool.id} : eol pool is empty`);
      }
    }

    uniquePoolId.add(pool.id);
    uniqueEarnedToken.add(pool.earnedToken);
    uniqueEarnedTokenAddress.add(pool.earnedTokenAddress);
    uniqueOracleId.add(pool.oracleId);

    const { keeper, strategyOwner, vaultOwner, beefyFeeRecipient } =
      addressBook[chain].platforms.beefyfinance;

    updates = isKeeperCorrect(pool, chain, keeper, updates);
    updates = isStratOwnerCorrect(pool, chain, strategyOwner, updates);
    updates = isVaultOwnerCorrect(pool, chain, vaultOwner, updates);
    updates = isBeefyFeeRecipientCorrect(pool, chain, beefyFeeRecipient, updates);
  });
  if (!isEmpty(updates)) {
    exitCode = 1;
  }

  if (outputPlatformSummary) {
    console.log(
      `Platforms: \n${Object.entries(platformCounts)
        .sort(([platformA], [platformB]) =>
          platformA.localeCompare(platformB, 'en', { sensitivity: 'base' })
        )
        .map(([platform, count]) => `\t${platform} (${count})`)
        .join('\n')}`
    );
  }

  console.log(`${chain} active pools: ${activePools}/${pools.length}\n`);

  return { chain, exitCode, updates };
};

// Validation helpers. These only log for now, could throw error if desired.
const isKeeperCorrect = (pool, chain, chainKeeper, updates) => {
  if (pool.status !== 'eol' && pool.keeper !== undefined && pool.keeper !== chainKeeper) {
    console.log(`Pool ${pool.id} should update keeper. From: ${pool.keeper} To: ${chainKeeper}`);

    if (!('keeper' in updates)) updates['keeper'] = {};
    if (!(chain in updates.keeper)) updates.keeper[chain] = {};

    if (pool.keeper in updates.keeper[chain]) {
      updates.keeper[chain][pool.keeper].push(pool.strategy);
    } else {
      updates.keeper[chain][pool.keeper] = [pool.strategy];
    }
  }

  return updates;
};

const isStratOwnerCorrect = (pool, chain, owner, updates) => {
  const validOwners = [...oldValidOwners, owner];
  if (pool.stratOwner !== undefined && !validOwners.includes(pool.stratOwner)) {
    console.log(`Pool ${pool.id} should update strat owner. From: ${pool.stratOwner} To: ${owner}`);

    if (!('stratOwner' in updates)) updates['stratOwner'] = {};
    if (!(chain in updates.stratOwner)) updates.stratOwner[chain] = {};

    if (pool.stratOwner in updates.stratOwner[chain]) {
      updates.stratOwner[chain][pool.stratOwner].push(pool.strategy);
    } else {
      updates.stratOwner[chain][pool.stratOwner] = [pool.strategy];
    }
  }

  return updates;
};

const isVaultOwnerCorrect = (pool, chain, owner, updates) => {
  const validOwners = [...oldValidOwners, owner];
  if (pool.vaultOwner !== undefined && !validOwners.includes(pool.vaultOwner)) {
    console.log(`Pool ${pool.id} should update vault owner. From: ${pool.vaultOwner} To: ${owner}`);

    if (!('vaultOwner' in updates)) updates['vaultOwner'] = {};
    if (!(chain in updates.vaultOwner)) updates.vaultOwner[chain] = {};

    if (pool.vaultOwner in updates.vaultOwner[chain]) {
      updates.vaultOwner[chain][pool.vaultOwner].push(pool.earnContractAddress);
    } else {
      updates.vaultOwner[chain][pool.vaultOwner] = [pool.earnContractAddress];
    }
  }

  return updates;
};

const isBeefyFeeRecipientCorrect = (pool, chain, recipient, updates) => {
  const validRecipients = oldValidFeeRecipients[chain] || [];
  if (
    pool.status === 'active' &&
    pool.beefyFeeRecipient !== undefined &&
    pool.beefyFeeRecipient !== recipient &&
    !validRecipients.includes(pool.beefyFeeRecipient)
  ) {
    console.log(
      `Pool ${pool.id} should update beefy fee recipient. From: ${pool.beefyFeeRecipient} To: ${recipient}`
    );

    if (!('beefyFeeRecipient' in updates)) updates['beefyFeeRecipient'] = {};
    if (!(chain in updates.beefyFeeRecipient)) updates.beefyFeeRecipient[chain] = {};

    if (pool.stratOwner in updates.beefyFeeRecipient[chain]) {
      updates.beefyFeeRecipient[chain][pool.stratOwner].push(pool.strategy);
    } else {
      updates.beefyFeeRecipient[chain][pool.stratOwner] = [pool.strategy];
    }
  }

  return updates;
};

// Helpers to populate required addresses.

const populateVaultsData = async (chain, pools, web3) => {
  const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);

  const calls = pools.map(pool => {
    const vaultContract = new web3.eth.Contract(vaultABI, pool.earnContractAddress);
    return {
      strategy: vaultContract.methods.strategy(),
      owner: vaultContract.methods.owner(),
      totalSupply: vaultContract.methods.totalSupply(),
    };
  });

  const [results] = await multicall.all([calls]);

  return pools.map((pool, i) => {
    return {
      ...pool,
      strategy: results[i].strategy,
      vaultOwner: results[i].owner,
      totalSupply: results[i].totalSupply,
    };
  });
};

const populateStrategyData = async (chain, pools, web3) => {
  const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);

  const calls = pools.map(pool => {
    const stratContract = new web3.eth.Contract(strategyABI, pool.strategy);
    return {
      keeper: stratContract.methods.keeper(),
      beefyFeeRecipient: stratContract.methods.beefyFeeRecipient(),
      owner: stratContract.methods.owner(),
    };
  });

  const [results] = await multicall.all([calls]);

  return pools.map((pool, i) => {
    return {
      ...pool,
      keeper: results[i].keeper,
      beefyFeeRecipient: results[i].beefyFeeRecipient,
      stratOwner: results[i].owner,
    };
  });
};

const override = pools => {
  Object.keys(overrides).forEach(id => {
    pools
      .filter(p => p.id.includes(id))
      .forEach(pool => {
        const override = overrides[id];
        Object.keys(override).forEach(key => {
          pool[key] = override[key];
        });
      });
  });
  return pools;
};

validatePools()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
