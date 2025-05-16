import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../data/store/hooks.ts';
import { fetchAllMinters } from '../../../../data/actions/minters.ts';
import type { VaultEntity } from '../../../../data/entities/vault.ts';
import {
  selectMintersByVaultId,
  selectShouldInitMinters,
} from '../../../../data/selectors/minters.ts';
import { MinterCard } from './MinterCard.tsx';

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
