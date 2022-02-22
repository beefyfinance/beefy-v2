import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { WritableDraft } from 'immer/dist/internal';
import { isEmpty } from 'lodash';
import { safetyScoreNum } from '../../../helpers/safetyScore';
import { BeefyState } from '../../../redux-types';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { fetchAllVaults, fetchFeaturedVaults } from '../actions/vaults';
import { FeaturedVaultConfig, VaultConfig } from '../apis/config';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity, VaultGov, VaultStandard, VaultTag } from '../entities/vault';
import {
  selectIsBeefyToken,
  selectIsTokenBluechip,
  selectIsTokenStable,
} from '../selectors/tokens';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type VaultsState = NormalizedEntity<VaultEntity> & {
  byChainId: {
    [chainId: ChainEntity['id']]: {
      // add quick access arrays
      // doesn't need to be by chain but it's convenient
      // for when we load by chain
      allActiveIds: VaultEntity['id'][];
      allRetiredIds: VaultEntity['id'][];

      // used to find a vault by it's token for balance stuff
      byOracleId: {
        [tokenId: TokenEntity['id']]: VaultEntity['id'][];
      };
      byEarnTokenId: {
        [tokenId: TokenEntity['id']]: VaultEntity['id'];
      };
    };
  };

  /**
   * pricePerFullShare is how you find out how much your mooTokens
   * (shares) represent in term of the underlying asset
   *
   * So if you deposit 1 BIFI you will get, for example 0.95 mooBIFI,
   * with a ppfs of X, if you multiply your mooBIIFI * ppfs you get your amount in BIFI
   *
   * That value is fetched from the smart contract upon loading
   **/
  contractData: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: {
        strategyAddress: string;
        pricePerFullShare: BigNumber;
      };
    };
  };

  /**
   * We want to know if the vault is featured or not
   */
  featuredVaults: FeaturedVaultConfig;
};
export const initialVaultsState: VaultsState = {
  byId: {},
  allIds: [],
  byChainId: {},
  contractData: { byVaultId: {} },
  featuredVaults: {},
};

export const vaultsSlice = createSlice({
  name: 'vaults',
  initialState: initialVaultsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchFeaturedVaults.fulfilled, (sliceState, action) => {
      sliceState.featuredVaults = action.payload.byVaultId;
    });

    builder.addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
      for (const [chainId, vaults] of Object.entries(action.payload.byChainId)) {
        for (const vault of vaults) {
          addVaultToState(action.payload.state, sliceState, chainId, vault);
        }
      }
    });

    builder.addCase(fetchAllContractDataByChainAction.fulfilled, (sliceState, action) => {
      for (const vaultContractData of action.payload.data.standardVaults) {
        const vaultId = vaultContractData.id;

        // only update it if needed
        if (sliceState.contractData.byVaultId[vaultId] === undefined) {
          sliceState.contractData.byVaultId[vaultId] = {
            pricePerFullShare: vaultContractData.pricePerFullShare,
            strategyAddress: vaultContractData.strategy,
          };
        }
      }
    });
  },
});

function addVaultToState(
  state: BeefyState,
  sliceState: WritableDraft<VaultsState>,
  chainId: ChainEntity['id'],
  apiVault: VaultConfig
) {
  // we already know this vault
  if (apiVault.id in sliceState.byId) {
    return;
  }
  const { tags, score } = getVaultTagsAndSafetyScore(state, chainId, apiVault);

  if (apiVault.isGovVault) {
    if (!apiVault.logo) {
      throw new Error(`Missing logo uri for gov vault ${apiVault.id}`);
    }
    const vault: VaultGov = {
      id: apiVault.id,
      logoUri: apiVault.logo,
      name: apiVault.name,
      isGovVault: true,
      earnedTokenId: apiVault.earnedToken,
      earnContractAddress: apiVault.poolAddress,
      excludedId: apiVault.excluded || null,
      oracleId: apiVault.oracleId,
      chainId: chainId,
      status: apiVault.status as VaultGov['status'],
      platformId: apiVault.platform.toLowerCase(),
      tags: tags,
      safetyScore: score,
      assetIds: apiVault.assets || [],
      type: 'single',
      risks: apiVault.risks || [],
    };

    sliceState.byId[vault.id] = vault;
    sliceState.allIds.push(vault.id);
    if (sliceState.byChainId[vault.chainId] === undefined) {
      sliceState.byChainId[vault.chainId] = {
        allActiveIds: [],
        allRetiredIds: [],
        byOracleId: {},
        byEarnTokenId: {},
      };
    }
    if (apiVault.status === 'eol' || apiVault.status === 'paused') {
      sliceState.byChainId[vault.chainId].allRetiredIds.push(vault.id);
    } else {
      sliceState.byChainId[vault.chainId].allActiveIds.push(vault.id);
    }
  } else {
    const vault: VaultStandard = {
      id: apiVault.id,
      name: apiVault.name,
      logoUri: apiVault.logo,
      isGovVault: false,
      contractAddress: apiVault.earnContractAddress,
      earnedTokenId: apiVault.earnedToken,
      oracleId: apiVault.oracleId,
      strategyType: apiVault.stratType as VaultStandard['strategyType'],
      chainId: chainId,
      platformId: apiVault.platform.toLowerCase(),
      status: apiVault.status as VaultStandard['status'],
      type: !apiVault.assets ? 'single' : apiVault.assets.length > 1 ? 'lps' : 'single',
      tags: tags,
      safetyScore: score,
      assetIds: apiVault.assets || [],
      risks: apiVault.risks || [],
    };
    // redux toolkit uses immer by default so we can
    // directly modify the state as usual
    sliceState.byId[vault.id] = vault;
    sliceState.allIds.push(vault.id);
    if (sliceState.byChainId[vault.chainId] === undefined) {
      sliceState.byChainId[vault.chainId] = {
        allActiveIds: [],
        allRetiredIds: [],
        byOracleId: {},
        byEarnTokenId: {},
      };
    }
    const vaultState = sliceState.byChainId[vault.chainId];
    if (apiVault.status === 'eol' || apiVault.status === 'paused') {
      vaultState.allRetiredIds.push(vault.id);
    } else {
      vaultState.allActiveIds.push(vault.id);
    }

    if (!vaultState.byOracleId[vault.oracleId]) {
      vaultState.byOracleId[vault.oracleId] = [];
    }
    vaultState.byOracleId[vault.oracleId].push(vault.id);
    vaultState.byEarnTokenId[vault.earnedTokenId] = vault.id;
  }
}

function getVaultTagsAndSafetyScore(
  state: BeefyState,
  chainId: ChainEntity['id'],
  apiVault: VaultConfig
): { tags: VaultTag[]; score: number } {
  const tags: VaultTag[] = [];
  if (
    apiVault.assets.every(tokenId => {
      return selectIsTokenStable(state, chainId, tokenId);
    })
  ) {
    tags.push('stable');
  }

  if (
    apiVault.assets.every(tokenId => {
      return selectIsBeefyToken(state, tokenId);
    })
  ) {
    tags.push('beefy');
  }

  if (
    apiVault.assets.every(tokenId => {
      return selectIsTokenBluechip(state, tokenId);
    })
  ) {
    tags.push('bluechip');
  }

  let score = 0;
  if (!isEmpty(apiVault.risks)) {
    score = safetyScoreNum(apiVault.risks);

    if (score >= 7.5) {
      tags.push('low');
    }
  }

  if (apiVault.status === 'eol') {
    tags.push('eol');
  } else if (apiVault.status === 'paused') {
    tags.push('paused');
  }

  return { tags, score };
}
