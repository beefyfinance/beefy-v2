import { css } from '@repo/styles/css';
import { memo, useDeferredValue } from 'react';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectFilteredVaults } from '../../../../../data/selectors/filtered-vaults.ts';
import { NoResults } from '../NoResults/NoResults.tsx';
import { VirtualVaultsList } from '../VirtualVaultsList/VirtualVaultsList.tsx';

export const VaultsList = memo(function VaultsList() {
  const vaultIds = useAppSelector(selectFilteredVaults);
  const deferredVaultIds = useDeferredValue(vaultIds);

  return (
    <div className={listClass}>
      {deferredVaultIds.length === 0 ?
        <NoResults />
      : <VirtualVaultsList vaultIds={deferredVaultIds} />}
    </div>
  );
});

const listClass = css({
  borderTop: 'solid 2px {colors.background.content.dark}',
});
