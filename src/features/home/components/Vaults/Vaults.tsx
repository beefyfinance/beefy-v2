import { memo } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { VaultsHeader } from './components/VaultsHeader/VaultsHeader.tsx';
import { VaultsList } from './components/VaultsList/VaultsList.tsx';

const useStyles = legacyMakeStyles(styles);

export const Vaults = memo(function Vaults() {
  const classes = useStyles();

  return (
    <div className={classes.vaults}>
      <VaultsHeader />
      <VaultsList />
    </div>
  );
});
