import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';
import type { VaultEntity } from '../../../../data/entities/vault.ts';
import {
  selectMintersByVaultId,
  selectShouldInitMinters,
} from '../../../../data/selectors/minters.ts';
import { fetchAllMinters } from '../../../../data/actions/minters.ts';
import { MinterCard } from './MinterCard.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../store.ts';

export type MinterCardsParams = PropsWithChildren<{
  vaultId: VaultEntity['id'];
}>;

export const Minters = memo(function Minters({ vaultId }: MinterCardsParams) {
  const dispatch = useAppDispatch();
  const shouldInitMinters = useAppSelector(selectShouldInitMinters);
  const minterCardIds = useAppSelector(state => selectMintersByVaultId(state, vaultId));

  useEffect(() => {
    if (shouldInitMinters) {
      dispatch(fetchAllMinters());
    }
  }, [dispatch, shouldInitMinters]);

  return (
    <>
      {minterCardIds.map(minterId => (
        <MinterCard vaultId={vaultId} minterId={minterId} key={minterId} />
      ))}
    </>
  );
});
