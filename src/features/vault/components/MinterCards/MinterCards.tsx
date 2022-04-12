import * as React from 'react';
import { memo, PropsWithChildren, useEffect } from 'react';
import { VaultEntity } from '../../../data/entities/vault';
import { useDispatch, useSelector } from 'react-redux';
import { selectMintersByVaultId, selectShouldInitMinters } from '../../../data/selectors/minters';
import { fetchAllMinters } from '../../../data/actions/minters';
import { Box } from '@material-ui/core';
import { MinterCard } from './MinterCard';
import { BeefyState } from '../../../../redux-types';

export type MinterCardsParams = PropsWithChildren<{
  vaultId: VaultEntity['id'];
}>;

export const MinterCards = memo<MinterCardsParams>(function MinterCards({ vaultId }) {
  const dispatch = useDispatch();
  const shouldInitMinters = useSelector(selectShouldInitMinters);
  const minterCardIds = useSelector((state: BeefyState) => selectMintersByVaultId(state, vaultId));

  useEffect(() => {
    if (shouldInitMinters) {
      dispatch(fetchAllMinters());
    }
  }, [dispatch, shouldInitMinters]);

  return (
    <>
      {minterCardIds.map(minterId => (
        <Box key={minterId}>
          <MinterCard vaultId={vaultId} minterId={minterId} />
        </Box>
      ))}
    </>
  );
});
