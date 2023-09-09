import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { PlatformDropdownFilter } from '../PlatformFilters';
import { styles } from './styles';
import { VaultCategoryDropdownFilter } from '../VaultCategoryFilters';
import { CheckboxFilter } from '../CheckboxFilter';
import { ShownVaultsCount } from './ShownVaultsCount';

const useStyles = makeStyles(styles);

export type ExtendedFiltersProps = {
  desktopView: boolean;
};
export const ExtendedFilters = memo<ExtendedFiltersProps>(function ExtendedFilters({
  desktopView,
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  const mobileView = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'), { noSsr: true });

  const platformFilterPlacement = useMemo(() => {
    return mobileView ? 'top-start' : 'bottom-start';
  }, [mobileView]);

  return (
    <div className={classes.extendedFilters}>
      <ShownVaultsCount className={classes.shownVaultsCount} />
      <CheckboxFilter className={classes.checkbox} filter="onlyBoosted" label={t('Filter-Boost')} />
      <CheckboxFilter
        className={classes.checkbox}
        filter="onlyZappable"
        label={t('Filter-Zappable')}
      />
      <CheckboxFilter
        className={classes.checkbox}
        filter="onlyRetired"
        label={t('Filter-Retired')}
      />
      <CheckboxFilter className={classes.checkbox} filter="onlyPaused" label={t('Filter-Paused')} />
      {!desktopView ? <VaultCategoryDropdownFilter /> : null}
      <PlatformDropdownFilter placement={platformFilterPlacement} />
    </div>
  );
});
