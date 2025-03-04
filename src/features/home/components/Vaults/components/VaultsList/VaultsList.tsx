import { memo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { selectFilteredVaults } from '../../../../../data/selectors/filtered-vaults.ts';
import { NoResults } from '../NoResults/NoResults.tsx';
import { VirtualVaultsList } from '../VirtualVaultsList/VirtualVaultsList.tsx';
import { styles } from './styles.ts';
import { useAppSelector } from '../../../../../../store.ts';

const useStyles = legacyMakeStyles(styles);

export const VaultsList = memo(function VaultsList() {
  const vaultIds = useAppSelector(selectFilteredVaults);
  const classes = useStyles();

  return (
    <div className={classes.vaultsList}>
      {vaultIds.length === 0 ? <NoResults /> : null}
      <VirtualVaultsList vaultIds={vaultIds} />
    </div>
  );
});
