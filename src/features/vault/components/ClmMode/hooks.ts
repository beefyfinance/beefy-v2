import { isVaultActive, type VaultEntity } from '../../../data/entities/vault.ts';
import { selectVaultByIdOrUndefined } from '../../../data/selectors/vaults.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';

/** a retired side can still be withdrawn from, but must not take new deposits */
export function useSideRetired(sideId: VaultEntity['id'] | undefined): boolean {
  return useAppSelector(state => {
    const vault = sideId ? selectVaultByIdOrUndefined(state, sideId) : undefined;
    return !!vault && !isVaultActive(vault);
  });
}
