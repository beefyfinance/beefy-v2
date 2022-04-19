import React, { memo, PropsWithChildren, useEffect, useMemo } from 'react';
import { VaultEntity } from '../../../data/entities/vault';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectInfoCardsByChainId,
  selectInfoCardsByVaultId,
  selectShouldInitInfoCards,
} from '../../../data/selectors/info-cards';
import { BeefyState } from '../../../../redux-types';
import { fetchAllInfoCards } from '../../../data/actions/info-cards';
import { ChainEntity } from '../../../data/entities/chain';
import { uniq } from 'lodash';
import { InfoCard } from './InfoCard';

export type InfoCardProps = PropsWithChildren<{
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
}>;

export const InfoCards = memo<InfoCardProps>(function InfoCards({ vaultId, chainId }) {
  const dispatch = useDispatch();
  const shouldInitInfoCards = useSelector(selectShouldInitInfoCards);
  const vaultInfoCardIds = useSelector((state: BeefyState) =>
    selectInfoCardsByVaultId(state, vaultId)
  );
  const chainInfoCardIds = useSelector((state: BeefyState) =>
    selectInfoCardsByChainId(state, chainId)
  );
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
