import { MultiCall } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { isEmpty, isValidChecksumAddress, maybeChecksumAddress } from './utils';
import { chainIds, chainRpcs, getBoostsForChain, getVaultsForChain } from './config';
import strategyABI from '../src/config/abi/strategy.json';
import vaultABI from '../src/config/abi/vault.json';
import platforms from '../src/config/platforms.json';
import strategyTypes from '../src/config/strategy-types.json';

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
  'baby-sol-bnb': { beefyFeeRecipient: undefined }, // 0x0
  'sicle-grape-mim': { beefyFeeRecipient: undefined },
};

const oldValidOwners = [
  addressBook.fantom.platforms.beefyfinance.devMultisig,
  addressBook.polygon.platforms.beefyfinance.devMultisig,
  addressBook.arbitrum.platforms.beefyfinance.devMultisig,
];

const oldValidFeeRecipients = {};

const addressFields = ['tokenAddress', 'earnedTokenAddress', 'earnContractAddress'];

const allowedEarnSameToken = new Set(['venus-wbnb']);

const validPlatformIds = platforms.map(platform => platform.id);
const validstrategyTypeIds = strategyTypes.map(strategyType => strategyType.id);

const oldFields = [
  'tokenDescription',
  'tokenDescriptionUrl',
  'pricePerFullShare',
  'tvl',
  'oraclePrice',
  'platform',
  'stratType',
  'logo',
  'depositsPaused',
  'withdrawalFee',
  'updatedFees',
];

const validatePools = async () => {
  let exitCode = 0;

  let updates = {};

  const uniquePoolId = new Set();

  let promises = [];
  for (const chainId of chainIds) {
    promises.push(validateSingleChain(chainId, uniquePoolId));
  }
  let results = await Promise.all(promises);

  exitCode = results.reduce((acum, cur) => (acum + cur.exitCode > 0 ? 1 : 0), 0);
  results.forEach(res => {
    if (!isEmpty(res.updates)) {
      updates[res.chainId] = res.updates;
    }
  });
  // Helpful data structures to correct addresses.
  console.log('Required updates.', JSON.stringify(updates));

  return exitCode;
};

const validateSingleChain = async (chainId, uniquePoolId) => {
  let [pools, boosts] = await Promise.all([getVaultsForChain(chainId), getBoostsForChain(chainId)]);

  if (chainId === 'one') {
    if (pools.length === 22) {
      console.log('Skip Harmony validation');
      return { chainId, exitCode: 0, updates: {} };
    } else {
      console.error(`Error: New Harmony pool added without validation`);
      return { chainId, exitCode: 1, updates: 'New Harmony pool added without validation' };
    }
  }
  console.log(`Validating ${pools.length} pools in ${chainId}...`);

  let updates: Record<string, Record<string, any>> = {};
  let exitCode = 0;
  //Governance pools should be separately verified
  pools = pools.filter(pool => !pool.isGovVault);

  const poolIds = new Set(pools.map(pool => pool.id));
  const uniqueEarnedToken = new Set();
  const uniqueEarnedTokenAddress = new Set();
  const uniqueOracleId = new Set();
  let activePools = 0;

  // Populate some extra data.
  const web3 = new Web3(chainRpcs[chainId]);
  pools = await populateVaultsData(chainId, pools, web3);
  pools = await populateStrategyData(chainId, pools, web3);

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

    if (!pool.strategyTypeId) {
      console.error(
        `Error: ${pool.id} : strategyTypeId missing vault strategy type; see strategy-types.json`
      );
      exitCode = 1;
    } else if (!validstrategyTypeIds.includes(pool.strategyTypeId)) {
      console.error(
        `Error: ${pool.id} : strategyTypeId ${pool.strategyTypeId} not present in strategy-types.json`
      );
      exitCode = 1;
    }

    if (!pool.platformId) {
      console.error(`Error: ${pool.id} : platformId missing vault platform; see platforms.json`);
      exitCode = 1;
    } else if (!validPlatformIds.includes(pool.platformId)) {
      console.error(
        `Error: ${pool.id} : platformId ${pool.platformId} not present in platforms.json`
      );
      exitCode = 1;
    }

    if (pool.oracle === 'lps') {
      if (!pool.tokenProviderId) {
        console.error(
          `Error: ${pool.id} : tokenProviderId missing LP provider platform; see platforms.json`
        );
        exitCode = 1;
      } else if (!validPlatformIds.includes(pool.tokenProviderId)) {
        console.error(
          `Error: ${pool.id} : tokenProviderId ${pool.tokenProviderId} not present in platforms.json`
        );
        exitCode = 1;
      }
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

    // Old fields we no longer need
    const fieldsToDelete = oldFields.filter(field => field in pool);
    if (fieldsToDelete.length) {
      console.error(
        `Error: ${pool.id} : These fields are no longer needed: ${fieldsToDelete.join(', ')}`
      );
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

    const { keeper, strategyOwner, vaultOwner, beefyFeeRecipient, beefyFeeConfig } =
      addressBook[chainId].platforms.beefyfinance;

    updates = isKeeperCorrect(pool, chainId, keeper, updates);
    updates = isStratOwnerCorrect(pool, chainId, strategyOwner, updates);
    updates = isVaultOwnerCorrect(pool, chainId, vaultOwner, updates);
    updates = isBeefyFeeRecipientCorrect(pool, chainId, beefyFeeRecipient, updates);
    updates = isBeefyFeeConfigCorrect(pool, chainId, beefyFeeConfig, updates);
  });

  // Boosts
  boosts.forEach(boost => {
    if (!poolIds.has(boost.poolId)) {
      console.error(`Error: Boost ${boost.id}: Boost has non-existent pool id ${boost.poolId}.`);
      exitCode = 1;
    }
  });

  if (!isEmpty(updates)) {
    exitCode = 1;
  }

  console.log(`${chainId} active pools: ${activePools}/${pools.length}\n`);

  return { chainId, exitCode, updates };
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

const isBeefyFeeConfigCorrect = (pool, chain, feeConfig, updates) => {
  if (
    pool.status === 'active' &&
    pool.beefyFeeConfig !== undefined &&
    pool.beefyFeeConfig !== feeConfig
  ) {
    console.log(
      `Pool ${pool.id} should update beefy fee config. From: ${pool.beefyFeeConfig} To: ${feeConfig}`
    );

    if (!('beefyFeeConfig' in updates)) updates['beefyFeeConfig'] = {};
    if (!(chain in updates.beefyFeeConfig)) updates.beefyFeeConfig[chain] = {};

    if (pool.stratOwner in updates.beefyFeeConfig[chain]) {
      updates.beefyFeeConfig[chain][pool.stratOwner].push(pool.strategy);
    } else {
      updates.beefyFeeConfig[chain][pool.stratOwner] = [pool.strategy];
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
      beefyFeeConfig: stratContract.methods.beefyFeeConfig(),
      owner: stratContract.methods.owner(),
    };
  });

  const [results] = await multicall.all([calls]);

  return pools.map((pool, i) => {
    return {
      ...pool,
      keeper: results[i].keeper,
      beefyFeeRecipient: results[i].beefyFeeRecipient,
      beefyFeeConfig: results[i].beefyFeeConfig,
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
