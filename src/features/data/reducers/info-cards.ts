import { createSlice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/internal';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { NormalizedEntity } from '../utils/normalized-entity';
import { fetchAllInfoCards } from '../actions/info-cards';
import { InfoCardConfig } from '../apis/config-types';
import { InfoCardChainEntity, InfoCardEntity, InfoCardVaultEntity } from '../entities/info-card';

export type InfoCardsState = NormalizedEntity<InfoCardEntity> & {
  byChainId: {
    [chainId: ChainEntity['id']]: InfoCardEntity['id'][];
  };
  byVaultId: {
    [vaultId: VaultEntity['id']]: InfoCardEntity['id'][];
  };
};

export const initialInfoCardsState: InfoCardsState = {
  byId: {},
  allIds: [],
  byChainId: {},
  byVaultId: {},
};

export const infoCardsSlice = createSlice({
  name: 'info-cards',
  initialState: initialInfoCardsState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchAllInfoCards.fulfilled, (sliceState, action) => {
      for (const infoCard of action.payload.cards) {
        addInfoCardToState(sliceState, infoCard);
      }
    });
  },
});

function addInfoCardToState(
  sliceState: WritableDraft<InfoCardsState>,
  apiConfigCard: InfoCardConfig
) {
  if (apiConfigCard.id in sliceState.byId) {
    return;
  }

  const card: InfoCardEntity = { ...apiConfigCard };

  // Add entity
  sliceState.byId[card.id] = card;
  sliceState.allIds.push(card.id);

  // Add to chain id index
  if (isChainInfoCard(card)) {
    for (const chainId of card.chainIds) {
      if (sliceState.byChainId[chainId] === undefined) {
        sliceState.byChainId[chainId] = [];
      }
      sliceState.byChainId[chainId].push(card.id);
    }
  }

  // Add to vault id index
  if (isVaultInfoCard(card)) {
    for (const vaultId of card.vaultIds) {
      if (sliceState.byVaultId[vaultId] === undefined) {
        sliceState.byVaultId[vaultId] = [];
      }
      sliceState.byVaultId[vaultId].push(card.id);
    }
  }
}

export function isChainInfoCard(card: InfoCardEntity): card is InfoCardChainEntity {
  return 'chainIds' in card;
}

export function isVaultInfoCard(card: InfoCardEntity): card is InfoCardVaultEntity {
  return 'vaultIds' in card;
}
