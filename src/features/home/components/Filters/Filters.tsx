import React, { memo } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { ChainButtonFilter, ChainDropdownFilter } from './components/ChainFilters';
import { UserCategoryButtonFilter } from './components/UserCategoryFilters';
import { AssetTypeButtonFilter } from './components/AssetTypeFilters';
import { styles } from './styles';
import { ExtendedFiltersButton } from './components/ExtendedFilters';
import { ClearFiltersButton } from './components/ClearFiltersButton';
import clsx from 'clsx';
import { VaultCategoryButtonFilter } from './components/VaultCategoryFilters';

const useStyles = makeStyles(styles);

export const Filters = memo(function Filters() {
  const classes = useStyles();
  const desktopView = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'), { noSsr: true });

  return (
    <div className={classes.filters}>
      {desktopView ? <ChainButtonFilter className={classes.chain} /> : null}
      <UserCategoryButtonFilter className={classes.userCategory} />
      {desktopView ? (
        <>
          <VaultCategoryButtonFilter className={classes.vaultCategory} />
          <AssetTypeButtonFilter className={classes.assetType} />
        </>
      ) : (
        <>
          <ChainDropdownFilter className={classes.chain} />
        </>
      )}
      <ExtendedFiltersButton
        className={clsx(classes.button, classes.extended)}
        desktopView={desktopView}
      />
      <ClearFiltersButton className={clsx(classes.button, classes.clear)} />
    </div>
  );
});
