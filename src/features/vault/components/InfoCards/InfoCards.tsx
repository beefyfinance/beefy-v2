import React, { memo, PropsWithChildren, useEffect, useMemo } from 'react';
import { VaultEntity } from '../../../data/entities/vault';
import {
  selectInfoCardsByChainId,
  selectInfoCardsByVaultId,
  selectShouldInitInfoCards,
} from '../../../data/selectors/info-cards';
import { fetchAllInfoCards } from '../../../data/actions/info-cards';
import { ChainEntity } from '../../../data/entities/chain';
import { uniq } from 'lodash';
import { InfoCard } from './InfoCard';
import { useAppDispatch, useAppSelector } from '../../../../store';

export type InfoCardProps = PropsWithChildren<{
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
}>;

export const InfoCards = memo<InfoCardProps>(function InfoCards({ vaultId, chainId }) {
  const dispatch = useAppDispatch();
  const shouldInitInfoCards = useAppSelector(selectShouldInitInfoCards);
  const vaultInfoCardIds = useAppSelector(state => selectInfoCardsByVaultId(state, vaultId));
  const chainInfoCardIds = useAppSelector(state => selectInfoCardsByChainId(state, chainId));
  const cardIds = useMemo(() => {
    return uniq(vaultInfoCardIds.concat(chainInfoCardIds));
  }, [vaultInfoCardIds, chainInfoCardIds]);

  useEffect(() => {
    if (shouldInitInfoCards) {
      dispatch(fetchAllInfoCards());
    }
  }, [dispatch, shouldInitInfoCards]);

  return (
    <>
      {cardIds.map(cardId => (
        <InfoCard key={cardId} cardId={cardId} />
      ))}
    </>
  );
});
