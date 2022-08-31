import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { InfoCardEntity } from '../entities/info-card';
import { isInitialLoader } from '../reducers/data-loader-types';

export const selectInfoCardById = (state: BeefyState, infoCardId: InfoCardEntity['id']) => {
  const infoCardsById = state.entities.infoCards.byId;
  if (infoCardsById[infoCardId] === undefined) {
    throw new Error(`selectInfoCardById: Unknown info card id ${infoCardId}`);
  }
  return infoCardsById[infoCardId];
};

export const selectInfoCardsByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): InfoCardEntity['id'][] => {
  return state.entities.infoCards.byVaultId[vaultId] || [];
};

export const selectInfoCardsByChainId = (
  state: BeefyState,
  chainId: ChainEntity['id']
): InfoCardEntity['id'][] => {
  return state.entities.infoCards.byChainId[chainId] || [];
};

export const selectAreInfoCardsLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.infoCards.alreadyLoadedOnce;

export const selectShouldInitInfoCards = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.infoCards);
