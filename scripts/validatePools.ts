import { MultiCall } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { isEmpty, isValidChecksumAddress, maybeChecksumAddress, sleep } from './common/utils';
import { getVaultsIntegrity } from './common/exclude';
import {
  addressBookToAppId,
  chainIds,
  chainRpcs,
  excludeChains,
  excludedChainIds,
  getBoostsForChain,
  getVaultsForChain,
} from './common/config';
import { getStrategyIds } from './common/strategies';
import strategyABI from '../src/config/abi/strategy.json';
import { StandardVaultAbi } from '../src/config/abi/StandardVaultAbi';
import platforms from '../src/config/platforms.json';
import partners from '../src/config/boost/partners.json';
import campaigns from '../src/config/boost/campaigns.json';
import pointProviders from '../src/config/points.json';
import type { PlatformType, VaultConfig } from '../src/features/data/apis/config-types';
import partition from 'lodash/partition';
import type { AbiItem } from 'web3-utils';
import i18keys from '../src/locales/en/main.json';
import { fileExists } from './common/files';

const overrides = {
  'bunny-bunny-eol': { keeper: undefined, stratOwner: undefined },
  'bifi-maxi': { stratOwner: undefined }, // harvester 0xDe30
  'beltv2-4belt': { vaultOwner: undefined }, // moonpot deployer
  'baseswap-axlwbtc-usdbc': { harvestOnDeposit: undefined },
  'kinetix-klp': { harvestOnDeposit: undefined },
  'bifi-vault': { beefyFeeRecipient: undefined }, // TODO: remove
  'png-wbtc.e-usdc': { harvestOnDeposit: undefined },
  'gmx-arb-glp': { harvestOnDeposit: undefined },
  'gmx-arb-gmx': { harvestOnDeposit: undefined },
  'swapbased-usd+-usdbc': { harvestOnDeposit: undefined },
  'swapbased-dai+-usd+': { harvestOnDeposit: undefined },
  'aero-cow-eurc-cbbtc-vault': { harvestOnDeposit: undefined },
  'pendle-eqb-arb-dwbtc-26jun25': { harvestOnDeposit: undefined },
  'pendle-arb-dwbtc-26jun25': { harvestOnDeposit: undefined },
};

const oldValidOwners = [
  addressBook.fantom.platforms.beefyfinance.devMultisig,
  addressBook.polygon.platforms.beefyfinance.devMultisig,
  addressBook.arbitrum.platforms.beefyfinance.devMultisig,
];

const oldValidFeeRecipients = {
  canto: '0xF09d213EE8a8B159C884b276b86E08E26B3bfF75',
  kava: '0x07F29FE11FbC17876D9376E3CD6F2112e81feA6F',
  moonriver: '0x617f12E04097F16e73934e84f35175a1B8196551',
  moonbeam: [
    '0x00aec34489a7ade91a0507b6b9dbb0a50938b7c0',
    '0x3E7F60B442CEAE0FE5e48e07EB85Cfb1Ed60e81A',
  ],
};

const oldValidRewardPoolOwners = {
  polygon: [
    '0x7313533ed72D2678bFD9393480D0A30f9AC45c1f',
    '0x97bfa4b212A153E15dCafb799e733bc7d1b70E72',
  ],
  kava: '0xF0d26842c3935A618e6980C53fDa3A2D10A02eb7',
  metis: '0x2cC364255206A7e14bF59ADB1fc5770DbA48CB3f',
  cronos: '0xF9eBb381dC153D0966B2BaEe776de2F400405755',
  celo: '0x32C82EE8Fca98ce5114D2060c5715AEc714152FB',
  canto: '0xeD7b88EDd899d578581DCcfce80F43D1F395b93f',
  moonriver: '0xD5e8D34dE3B1A6fd54e87B5d4a857CBB762d0C8A',
  moonbeam: '0x00AeC34489A7ADE91A0507B6b9dBb0a50938B7c0',
  aurora: '0x9dA9f3C6c45F1160b53D395b0A982aEEE1D212fE',
  ethereum: [
    '0x1c9270ac5C42E51611d7b97b1004313D52c80293',
    '0x8237f3992526036787E8178Def36291Ab94638CD',
  ],
  avax: [
    '0x48beD04cBC52B5676C04fa94be5786Cdc9f266f5',
    '0xc1464638B11b9BAac9525cf7bF2B4A52Ccbde885',
  ],
  arbitrum: '0xFEd99885fE647dD44bEA2B375Bd8A81490bF6E0f',
  bsc: ['0xAb4e8665E7b0E6D83B65b8FF6521E347ca93E4F8', '0x0000000000000000000000000000000000000000'],
  fantom: '0x35F43b181957824f2b5C0EF9856F85c90fECb3c8',
  optimism: [
    '0xEDFBeC807304951785b581dB401fDf76b4bAd1b0',
    '0x3Cd5Ae887Ddf78c58c9C1a063EB343F942DbbcE8',
    addressBook.optimism.platforms.beefyfinance.strategyOwner,
  ],
};

const nonHarvestOnDepositChains = ['ethereum', 'avax', 'rootstock'];
const nonHarvestOnDepositPools = [
  'venus-bnb',
  'pendle-eqb-base-lbtc-29may25',
  'silo-eth-pendle-weeth',
  'silo-op-tbtc-tbtc',
  'sushi-cow-arb-wbtc-tbtc-vault',
  'pancake-cow-arb-usdt+-usd+-vault',
  'aero-cow-weth-cbbtc-vault',
  'aero-cow-usdc-cbbtc-vault',
  'compound-op-usdt',
  'compound-op-usdc',
  'compound-op-eth',
  'compound-base-usdc',
  'nuri-cow-scroll-usdc-scr-vault',
  'tokan-wbtc-weth',
  'aero-cow-usdz-cbbtc-vault',
  'aero-cow-eurc-usdc-vault',
  'silov2-sonic-usdce-ws',
];
const excludedAbPools = [
  'gmx-arb-near-usdc',
  'gmx-arb-atom-usdc',
  'gmx-arb-bnb-usdc',
  'gmx-arb-xrp-usdc',
  'gmx-arb-doge-usdc',
];
const addressFields = ['tokenAddress', 'earnedTokenAddress', 'earnContractAddress'];

const validPlatformIds = platforms.map(platform => platform.id);
const validStrategyIds = getStrategyIds();
const validPointProviderIds = pointProviders.map(pointProvider => pointProvider.id);

const oldFields = {
  tokenDescription: 'Use addressbook',
  tokenDescriptionUrl: 'Use addressbook',
  pricePerFullShare: 'Not required',
  tvl: 'Not required',
  oraclePrice: 'Not required',
  platform: 'Use platformId',
  stratType: 'Use strategyTypeId',
  logo: 'Not required',
  depositsPaused: 'Use status: paused',
  withdrawalFee: 'Not required (use api)',
  updatedFees: 'Not required',
  mintTokenUrl: 'Use minters config',
  callFee: 'Not required (use api)',
  tokenAmmId: 'Use zap: VaultZapConfig if needed',
  isGovVault: 'Use type: gov',
};

const validatePools = async () => {
  let exitCode = 0;
  let updates = {};
  const uniquePoolId = new Set();

  if (excludedChainIds.length > 0) {
    console.warn(`*** Excluded chains: ${excludedChainIds.join(', ')} ***`);
    const integrities = await Promise.all(
      excludedChainIds.map(chainId => getVaultsIntegrity(chainId))
    );
    excludedChainIds.forEach((chainId, i) => {
      const integrityNow = integrities[i];
      const integrityThen = excludeChains[chainId];

      if (!integrityThen) {
        console.error(`Missing integrity data for excluded chain ${chainId}`);
        exitCode = 1;
        return;
      }

      if (!integrityNow) {
        console.error(`Failed to perform integrity check for excluded chain ${chainId}`);
        exitCode = 1;
        return;
      }

      if (integrityNow.count !== integrityThen.count) {
        console.error(
          `Vault count changed for excluded chain ${chainId}: ${integrityThen.count} -> ${integrityNow.count}`
        );
        exitCode = 1;
        return;
      }

      if (integrityNow.hash !== integrityThen.hash) {
        console.error(
          `Vault hash changed for excluded chain ${chainId}: ${integrityThen.hash} -> ${integrityNow.hash}`
        );
        exitCode = 1;
        return;
      }

      console.log(`Excluded chain ${chainId} integrity check passed`);
    });

    if (exitCode != 0) {
      console.error('*** Excluded chain integrity check failed ***');
      console.error('If you removed a vault, update excludeChains in scripts/common/config.ts');
      return exitCode;
    }
  }

  const platformExitCode = await validatePlatformTypes();
  if (platformExitCode !== 0) {
    exitCode = platformExitCode;
  }

  let promises = chainIds.map(chainId => validateSingleChain(chainId, uniquePoolId));
  let results = await Promise.all(promises);

  exitCode = results.reduce((acum, cur) => (acum + cur.exitCode > 0 ? 1 : 0), exitCode);
  results.forEach(res => {
    if (!isEmpty(res.updates)) {
      updates[res.chainId] = res.updates;
    }
  });
  // Helpful data structures to correct addresses.
  console.log('Required updates.', JSON.stringify(updates));

  if (excludedChainIds.length > 0) {
    console.warn(`*** Excluded chains: ${excludedChainIds.join(', ')} ***`);
  }

  return exitCode;
};

const validateSingleChain = async (chainId, uniquePoolId) => {
  let [pools, boosts] = await Promise.all([getVaultsForChain(chainId), getBoostsForChain(chainId)]);

  console.log(`Validating ${pools.length} pools in ${chainId}...`);

  let updates: Record<string, Record<string, any>> = {};
  let exitCode = 0;

  //Governance pools should be separately verified
  const [govPools, vaultPools] = partition(pools, pool => pool.type === 'gov');
  pools = vaultPools;

  const poolIds = new Set(pools.map(pool => pool.id));
  const uniqueEarnedToken = new Set();
  const uniqueEarnedTokenAddress = new Set();
  const uniqueOracleId = new Set();
  const govPoolsByDepositAddress = new Map(govPools.map(pool => [pool.tokenAddress, pool]));
  let activePools = 0;

  // Populate some extra data.
  const web3 = new Web3(chainRpcs[chainId]);
  const poolsWithGovData = await populateGovData(chainId, govPools, web3);
  const poolsWithVaultData = await populateVaultsData(chainId, pools, web3);
  const poolsWithStrategyData = override(
    await populateStrategyData(chainId, poolsWithVaultData, web3)
  );
  const clmsWithData = await populateCowcentratedData(chainId, pools, web3);

  poolsWithStrategyData.forEach(pool => {
    // Errors, should not proceed with build
    if (uniquePoolId.has(pool.id)) {
      console.error(`Error: ${pool.id} : Pool id duplicated: ${pool.id}`);
      exitCode = 1;
    }

    if (uniqueEarnedToken.has(pool.earnedToken)) {
      console.error(`Error: ${pool.id} : Pool earnedToken duplicated: ${pool.earnedToken}`);
      exitCode = 1;
    }

    if (uniqueEarnedTokenAddress.has(pool.earnedTokenAddress)) {
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
      console.error(`Error: ${pool.id} : strategyTypeId missing vault strategy type`);
      exitCode = 1;
    } else if (!validStrategyIds[pool.type].has(pool.strategyTypeId)) {
      console.error(
        `Error: ${pool.id} : strategyTypeId invalid, "StrategyDescription-${pool.type}-${pool.strategyTypeId}" not present in locales/en/risks.json`
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

    if (pool.status === 'eol') {
      if (!pool.retiredAt) {
        console.error(`Error: ${pool.id} : Pool retiredAt timestamp missing`);
        exitCode = 1;
      } else if (
        typeof pool.retiredAt !== 'number' ||
        isNaN(pool.retiredAt) ||
        !isFinite(pool.retiredAt)
      ) {
        console.error(
          `Error: ${pool.id} : Pool retiredAt timestamp wrong type, should be a number`
        );
        exitCode = 1;
      }
    }

    if (pool.status === 'paused') {
      if (!pool.pausedAt) {
        console.error(`Error: ${pool.id} : Pool pausedAt timestamp missing`);
        exitCode = 1;
      } else if (
        typeof pool.pausedAt !== 'number' ||
        isNaN(pool.pausedAt) ||
        !isFinite(pool.pausedAt)
      ) {
        console.error(`Error: ${pool.id} : Pool pausedAt timestamp wrong type, should be a number`);
        exitCode = 1;
      }
    }

    if (!pool.network) {
      console.error(`Error: ${pool.id} : Missing network`);
      exitCode = 1;
    } else if (pool.network !== addressBookToAppId(chainId)) {
      console.error(
        `Error: ${pool.id} : Network mismatch ${pool.network} != ${addressBookToAppId(chainId)}`
      );
      exitCode = 1;
    }

    // Assets
    if (!pool.assets || !Array.isArray(pool.assets) || !pool.assets.length) {
      console.error(`Error: ${pool.id} : Missing assets array`);
      exitCode = 1;
    } else if (pool.status !== 'eol') {
      for (const assetId of pool.assets) {
        if (!(assetId in addressBook[chainId].tokens)) {
          if (excludedAbPools.includes(pool.id)) continue;
          // just warn for now
          console.warn(`Warning: ${pool.id} : Asset ${assetId} not in addressbook on ${chainId}`);
          // exitCode = 1;
        }
      }
    }

    // Cowcentrated should have RP
    if (pool.type === 'cowcentrated' && pool.status !== 'eol') {
      const govPool = govPoolsByDepositAddress.get(pool.earnContractAddress);
      if (!govPool) {
        console.error(`Error: ${pool.id} : CLM missing CLM pool`);
        exitCode = 1;
      }
    }

    // Old fields we no longer need
    const fieldsToDelete = Object.keys(oldFields).filter(field => field in pool);
    if (fieldsToDelete.length) {
      console.error(
        `Error: ${pool.id} : These fields are no longer needed: ${fieldsToDelete.join(', ')}`
      );
      fieldsToDelete.forEach(field => console.log(`\t${field}: '${oldFields[field]}',`));
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

    if (new BigNumber(pool.totalSupply || '0').isZero()) {
      if (pool.status !== 'eol') {
        console.error(`Error: ${pool.id} : Pool is empty`);
        exitCode = 1;
        if (!('emptyVault' in updates)) updates['emptyVault'] = {};
        updates.emptyVault[pool.id] = pool.earnContractAddress;
      } else {
        console.warn(`${pool.id} : eol pool is empty`);
      }
    }
    if (checkPointsStructureIds(pool) > 0) {
      exitCode = 1;
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
    updates = isHarvestOnDepositCorrect(pool, chainId, updates);
  });

  // Boosts
  const seenBoostIds = new Set();
  boosts.forEach(boost => {
    if (seenBoostIds.has(boost.id)) {
      console.error(`Error: Boost ${boost.id}: Boost id duplicated: ${boost.id}`);
      exitCode = 1;
    }
    seenBoostIds.add(boost.id);

    if (!poolIds.has(boost.poolId)) {
      console.error(`Error: Boost ${boost.id}: Boost has non-existent pool id ${boost.poolId}.`);
      exitCode = 1;
      return;
    }

    if ((boost.partners || []).length === 0 && !boost.campaign) {
      console.error(`Error: Boost ${boost.id}: Boost has no partners or campaign.`);
      exitCode = 1;
      return;
    }

    if (boost.partners && boost.partners.length) {
      const invalidPartners = boost.partners.filter(partner => !(partner in partners));
      if (invalidPartners.length) {
        console.error(`Error: Boost ${boost.id}: Missing partners: ${invalidPartners.join(', ')}`);
        exitCode = 1;
        return;
      }
    }

    if (boost.campaign && !(boost.campaign in campaigns)) {
      console.error(`Error: Boost ${boost.id}: Missing campaign: ${boost.campaign}`);
      exitCode = 1;
      return;
    }

    if (boost.assets && boost.assets.length) {
      for (const assetId of boost.assets) {
        if (!assetId?.trim().length) {
          console.error(`Error: Boost ${boost.id}: Asset id is empty`);
          exitCode = 1;
        }
        // TODO need to tidy up old boosts before we can enable this
        // if (!(assetId in addressBook[chainId].tokens)) {
        //   console.error(`Error: Boost ${boost.id}: Asset "${assetId}" not in addressbook on ${chainId}`);
        //   exitCode = 1;
        // }
      }
    }

    const earnedVault = pools.find(pool => pool.earnContractAddress === boost.earnedTokenAddress);
    if (earnedVault) {
      if (boost.earnedTokenDecimals !== 18) {
        console.error(
          `Error: Boost ${boost.id}: Earned token decimals mismatch ${boost.earnedTokenDecimals} != 18`
        );
        exitCode = 1;
        return;
      }
      // TODO oracle etc
    } else {
      const earnedToken = addressBook[chainId].tokens[boost.earnedToken];
      if (!earnedToken) {
        // TODO need to tidy up old boosts before we can enable this
        // console.error(`Error: Boost ${boost.id}: Earned token ${boost.earnedToken} not in addressbook`);
        // exitCode = 1;
        return;
      }

      if (earnedToken.address !== boost.earnedTokenAddress) {
        console.error(
          `Error: Boost ${boost.id}: Earned token address mismatch ${boost.earnedTokenAddress} != ${earnedToken.address}`
        );
        exitCode = 1;
        return;
      }

      if (earnedToken.decimals !== boost.earnedTokenDecimals) {
        console.error(
          `Error: Boost ${boost.id}: Earned token decimals mismatch ${boost.earnedTokenDecimals} != ${earnedToken.decimals}`
        );
        exitCode = 1;
        return;
      }

      if (earnedToken.oracleId !== boost.earnedOracleId) {
        console.error(
          `Error: Boost ${boost.id}: Earned token oracle id mismatch ${boost.earnedOracleId} != ${earnedToken.oracleId}`
        );
        exitCode = 1;
        return;
      }
    }
  });

  // Gov Pools
  poolsWithGovData.forEach(pool => {
    if (!pool.strategyTypeId) {
      console.error(`Error: ${pool.id} : strategyTypeId missing gov strategy type`);
      exitCode = 1;
    } else if (!validStrategyIds.gov.has(pool.strategyTypeId)) {
      console.error(
        `Error: ${pool.id} : strategyTypeId invalid, "StrategyDescription-${pool.type}-${pool.strategyTypeId}" not present in locales/en/risks.json`
      );
      exitCode = 1;
    }

    if (checkPointsStructureIds(pool) > 0) {
      exitCode = 1;
    }

    const { devMultisig } = addressBook[chainId].platforms.beefyfinance;
    updates = isRewardPoolOwnerCorrect(pool, chainId, devMultisig, updates);
  });

  // CLMs
  clmsWithData.forEach(clm => {
    if (!clm.oracleForToken0) {
      console.error(
        `Error: ${clm.id} : Beefy oracle has no subOracle entry for token0 ${clm.token0}`
      );
      exitCode = 1;
    }
    if (!clm.oracleForToken1) {
      console.error(
        `Error: ${clm.id} : Beefy oracle has no subOracle entry for token1 ${clm.token1}`
      );
      exitCode = 1;
    }

    if (checkPointsStructureIds(clm) > 0) {
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

const isRewardPoolOwnerCorrect = (pool, chain, owner, updates) => {
  const validOwners: string[] = oldValidRewardPoolOwners[chain] || [];
  if (
    pool.rewardPoolOwner !== undefined &&
    pool.rewardPoolOwner !== owner &&
    !validOwners.includes(pool.rewardPoolOwner)
  ) {
    console.log(
      `Reward Pool ${pool.id} should update owner. From: ${pool.rewardPoolOwner} To: ${owner}`
    );

    if (!('rewardPoolOwner' in updates)) updates['rewardPoolOwner'] = {};
    if (!(chain in updates.rewardPoolOwner)) updates.rewardPoolOwner[chain] = {};

    if (pool.rewardPoolOwner in updates.rewardPoolOwner[chain]) {
      updates.rewardPoolOwner[chain][pool.rewardPoolOwner].push(pool.earnContractAddress);
    } else {
      updates.rewardPoolOwner[chain][pool.rewardPoolOwner] = [pool.earnContractAddress];
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

const isHarvestOnDepositCorrect = (pool, chain, updates) => {
  if (
    pool.status === 'active' &&
    pool.harvestOnDeposit !== undefined &&
    !nonHarvestOnDepositChains.includes(chain) &&
    !nonHarvestOnDepositPools.includes(pool.id) &&
    pool.harvestOnDeposit !== true
  ) {
    console.log(
      `Pool ${pool.id} should update to harvest on deposit. From: ${pool.harvestOnDeposit} To: true`
    );

    if (!('harvestOnDeposit' in updates)) updates['harvestOnDeposit'] = {};
    if (!(chain in updates.harvestOnDeposit)) updates.harvestOnDeposit[chain] = {};

    if (pool.harvestOnDeposit in updates.harvestOnDeposit[chain]) {
      updates.harvestOnDeposit[chain][pool.harvestOnDeposit].push(pool.harvestOnDeposit);
    } else {
      updates.harvestOnDeposit[chain][pool.harvestOnDeposit] = [pool.harvestOnDeposit];
    }
  }

  return updates;
};

const checkPointsStructureIds = pool => {
  let exitCode = 0;

  if (pool.pointStructureIds && pool.pointStructureIds.length > 0) {
    const invalidPointStructureIds = pool.pointStructureIds!.filter(
      p => !validPointProviderIds.includes(p)
    );
    if (invalidPointStructureIds.length > 0) {
      console.error(
        `Error: ${pool.id} : pointStructureIds ${invalidPointStructureIds} not present in points.json`
      );
      exitCode = 1;
    }
  }

  // check for the provider eligibility
  for (const pointProvider of pointProviders) {
    const hasProvider = pool.pointStructureIds?.includes(pointProvider.id) ?? false;

    const shouldHaveProviderArr: boolean[] = [];
    for (const eligibility of pointProvider.eligibility) {
      if (eligibility.type === 'token-by-provider') {
        if (!('tokens' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokens missing`);
        }
        if (!('tokenProviderId' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokenProviderId missing`);
        }

        shouldHaveProviderArr.push(
          (pool.tokenProviderId === eligibility.tokenProviderId &&
            pool.assets?.some(a => eligibility.tokens?.includes(a))) ??
            false
        );
      } else if (eligibility.type === 'token-on-platform') {
        if (!('tokens' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokens missing`);
        }
        if (!('platformId' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.platformId missing`);
        }

        shouldHaveProviderArr.push(
          (eligibility.platformId === pool.platformId &&
            pool.assets?.some(a => eligibility.tokens.includes(a))) ??
            false
        );
      } else if (eligibility.type === 'token-holding') {
        if (!('tokens' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokens missing`);
        }

        shouldHaveProviderArr.push(
          pool.assets?.some(a => eligibility?.tokens?.includes(a)) ?? false
        );
      } else if (eligibility.type === 'on-chain-lp') {
        if (!('chain' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.chain missing`);
        }

        shouldHaveProviderArr.push(pool.network === eligibility.chain);
      } else if (eligibility.type === 'earned-token-name-regex') {
        if (!('regex' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.regex missing`);
        }
        const earnedToken = pool.earnedToken;
        const regex = new RegExp(eligibility.regex as string);
        shouldHaveProviderArr.push(regex.test(earnedToken));
      } else if (eligibility.type === 'vault-whitelist') {
        shouldHaveProviderArr.push(hasProvider);
      }
    }

    // bool or
    const shouldHaveProvider = shouldHaveProviderArr.some(Boolean);

    if (shouldHaveProvider && !hasProvider) {
      console.error(
        `Error: ${pool.id} : pointStructureId ${pointProvider.id} should be present in pointStructureIds`
      );
      exitCode = 1;
    } else if (!shouldHaveProvider && hasProvider) {
      console.error(
        `Error: ${pool.id} : pointStructureId ${pointProvider.id} should NOT be present in pointStructureIds`
      );
      exitCode = 1;
    }
  }

  return exitCode;
};

// Helpers to populate required addresses.

type VaultConfigWithGovData = Omit<VaultConfig, 'type'> & {
  type: NonNullable<VaultConfig['type']>;
  rewardPoolOwner: string | undefined;
};
const populateGovData = async (
  chain,
  pools: VaultConfig[],
  web3,
  retries = 5
): Promise<VaultConfigWithGovData[]> => {
  try {
    const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);

    const calls = pools.map(pool => {
      const vaultContract = new web3.eth.Contract(
        StandardVaultAbi as unknown as AbiItem[],
        pool.earnContractAddress
      );
      return {
        owner: vaultContract.methods.owner(),
      };
    });

    try {
      const [results] = await multicall.all([calls]);
      return pools.map((pool, i) => {
        return {
          ...pool,
          type: pool.type || 'gov',
          rewardPoolOwner: results[i].owner,
        };
      });
    } catch (e) {
      if (retries > 0) {
        console.warn(`retrying populateGovData on ${chain} ${e.message}`);
        await sleep(1_000);
        return populateGovData(chain, pools, web3, retries - 1);
      }
      throw e;
    }
  } catch (e) {
    throw new Error(`Failed to populate gov data for ${chain}`, { cause: e });
  }
};

type ClmVaultConfig = Omit<VaultConfig, 'type'> & { type: 'cowcentrated' };
type VaultConfigWithCowcentratedData = ClmVaultConfig & {
  token0: string;
  token1: string;
  oracleForToken0: boolean;
  oracleForToken1: boolean;
};

const populateCowcentratedData = async (
  chain: keyof typeof addressBook,
  pools: VaultConfig[],
  web3: Web3,
  retries = 5
): Promise<VaultConfigWithCowcentratedData[]> => {
  try {
    const clms = pools.filter((p): p is ClmVaultConfig => p.type === 'cowcentrated');
    if (clms.length === 0) {
      return [];
    }

    const { multicall: multicallAddress, beefyOracle: beefyOracleAddress } =
      addressBook[chain].platforms.beefyfinance;
    if (!multicallAddress || !beefyOracleAddress) {
      throw new Error('Missing multicall or beefyOracle address');
    }

    const multicall = new MultiCall(web3, multicallAddress);
    const beefyOracle = new web3.eth.Contract(
      [
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          name: 'subOracle',
          outputs: [
            {
              internalType: 'address',
              name: 'oracle',
              type: 'address',
            },
            {
              internalType: 'bytes',
              name: 'data',
              type: 'bytes',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          name: 'subOracle',
          outputs: [
            {
              internalType: 'address',
              name: 'oracle',
              type: 'address',
            },
            {
              internalType: 'bytes',
              name: 'data',
              type: 'bytes',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      beefyOracleAddress
    );
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    try {
      const tokenResults = (
        await multicall.all([
          clms.map(clm => {
            const vaultContract = new web3.eth.Contract(
              [
                {
                  inputs: [],
                  name: 'wants',
                  outputs: [
                    {
                      internalType: 'address',
                      name: 'token0',
                      type: 'address',
                    },
                    {
                      internalType: 'address',
                      name: 'token1',
                      type: 'address',
                    },
                  ],
                  stateMutability: 'view',
                  type: 'function',
                },
              ],
              clm.earnContractAddress
            );
            return {
              wants: vaultContract.methods.wants(),
            };
          }),
        ])
      )
        .flat()
        .map(result => ({
          token0: result.wants[0],
          token1: result.wants[1],
        }));

      const oracleResults = (
        await multicall.all([
          tokenResults.map(result => ({
            token0: beefyOracle.methods.subOracle(result.token0),
            token1: beefyOracle.methods.subOracle(result.token1),
            token0For0xZero: beefyOracle.methods.subOracle(ZERO_ADDRESS, result.token0),
            token1For0xZero: beefyOracle.methods.subOracle(ZERO_ADDRESS, result.token1),
          })),
        ])
      )
        .flat()
        .map(result => ({
          oracleForToken0:
            (result.token0 && result.token0[0] && result.token0[0] !== ZERO_ADDRESS) ||
            (result.token0For0xZero &&
              result.token0For0xZero[0] &&
              result.token0For0xZero[0] !== ZERO_ADDRESS),
          oracleForToken1:
            (result.token1 && result.token1[0] && result.token1[0] !== ZERO_ADDRESS) ||
            (result.token1For0xZero &&
              result.token1For0xZero[0] &&
              result.token1For0xZero[0] !== ZERO_ADDRESS),
        }));

      return clms.map((clm, i) => ({
        ...clm,
        token0: tokenResults[i].token0,
        token1: tokenResults[i].token1,
        oracleForToken0: oracleResults[i].oracleForToken0,
        oracleForToken1: oracleResults[i].oracleForToken1,
      }));
    } catch (e) {
      if (retries > 0) {
        console.warn(`retrying populateCowcentratedData ${e.message}`);
        await sleep(1_000);
        return populateCowcentratedData(chain, pools, web3, retries - 1);
      }
      throw e;
    }
  } catch (e) {
    throw new Error(`Failed to populate cowcentrated data for ${chain}`, { cause: e });
  }
};

type VaultConfigWithVaultData = Omit<VaultConfig, 'type'> & {
  type: NonNullable<VaultConfig['type']>;
  strategy: string | undefined;
  vaultOwner: string | undefined;
  totalSupply: string | undefined;
};
const populateVaultsData = async (
  chain,
  pools: VaultConfig[],
  web3,
  retries = 5
): Promise<VaultConfigWithVaultData[]> => {
  try {
    const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);

    const calls = pools.map(pool => {
      const vaultContract = new web3.eth.Contract(
        StandardVaultAbi as unknown as AbiItem[],
        pool.earnContractAddress
      );
      return {
        strategy: vaultContract.methods.strategy(),
        owner: vaultContract.methods.owner(),
        totalSupply: vaultContract.methods.totalSupply(),
      };
    });

    try {
      const [results] = await multicall.all([calls]);

      return pools.map((pool, i) => {
        return {
          ...pool,
          type: pool.type || 'standard',
          strategy: results[i].strategy,
          vaultOwner: results[i].owner,
          totalSupply: results[i].totalSupply,
        };
      });
    } catch (e) {
      if (retries > 0) {
        console.warn(`retrying populateVaultsData ${e.message}`);
        await sleep(1_000);
        return populateVaultsData(chain, pools, web3, retries - 1);
      }
      throw e;
    }
  } catch (e) {
    throw new Error(`Failed to populate vault data for ${chain}`, { cause: e });
  }
};

type VaultConfigWithStrategyData = VaultConfigWithVaultData & {
  keeper: string | undefined;
  beefyFeeRecipient: string | undefined;
  beefyFeeConfig: string | undefined;
  stratOwner: string | undefined;
  harvestOnDeposit: boolean | undefined;
};
const populateStrategyData = async (
  chain,
  pools: VaultConfigWithVaultData[],
  web3,
  retries = 5
): Promise<VaultConfigWithStrategyData[]> => {
  const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);

  const calls = pools.map(pool => {
    const stratContract = new web3.eth.Contract(strategyABI, pool.strategy);
    return {
      keeper: stratContract.methods.keeper(),
      beefyFeeRecipient: stratContract.methods.beefyFeeRecipient(),
      beefyFeeConfig: stratContract.methods.beefyFeeConfig(),
      owner: stratContract.methods.owner(),
      harvestOnDeposit: stratContract.methods.harvestOnDeposit(),
    };
  });

  try {
    const [results] = await multicall.all([calls]);

    return pools.map((pool, i) => {
      return {
        ...pool,
        keeper: results[i].keeper,
        beefyFeeRecipient: results[i].beefyFeeRecipient,
        beefyFeeConfig: results[i].beefyFeeConfig,
        stratOwner: results[i].owner,
        harvestOnDeposit: results[i].harvestOnDeposit,
      };
    });
  } catch (e) {
    if (retries > 0) {
      console.warn(`retrying populateStrategyData ${e.message}`);
      await sleep(1_000);
      return populateStrategyData(chain, pools, web3, retries - 1);
    }
    throw e;
  }
};

async function validatePlatformTypes(): Promise<number> {
  let exitCode = 0;
  // hack to make sure all the platform types in PlatformType are present in the set
  const validTypes = new Set<string>(
    Object.keys({
      amm: true,
      alm: true,
      bridge: true,
      'money-market': true,
      perps: true,
      'yield-boost': true,
      farm: true,
    } satisfies Record<PlatformType, unknown>)
  );

  // Check if valid types have i18n keys
  for (const type of validTypes.keys()) {
    const requiredKeys = [
      `Details-Platform-Type-Description-${type}`,
      `Details-Platform-Type-${type}`,
    ];
    for (const key of requiredKeys) {
      if (!i18keys[key]) {
        console.error(`Missing i18n key "${key}" for platform type "${type}"`);
        exitCode = 1;
      }
    }
  }

  const platformsWithType = platforms.filter(
    (
      platform
    ): platform is Extract<
      (typeof platforms)[number],
      {
        type: string;
      }
    > => !!platform.type
  );
  await Promise.all(
    platformsWithType.map(async platform => {
      // Check type is valid
      if (!validTypes.has(platform.type)) {
        console.error(`Platform ${platform.id}: Invalid type "${platform.type}"`);
        exitCode = 1;
      }

      // Platform image must exist if platform has a type
      const possiblePaths = [
        `./src/images/platforms/${platform.id}.svg`,
        `./src/images/platforms/${platform.id}.png`,
      ];
      let found = false;
      for (const path of possiblePaths) {
        if (await fileExists(path)) {
          found = true;
          break;
        }
      }
      if (!found) {
        console.error(`Platform ${platform.id}: Missing image: "${possiblePaths[0]}"`);
        exitCode = 1;
      }
    })
  );

  return exitCode;
}

const override = (pools: VaultConfigWithVaultData[]): VaultConfigWithVaultData[] => {
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
