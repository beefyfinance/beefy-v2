import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { PlatformDropdownFilter } from '../PlatformFilters';
import { styles } from './styles';
import { VaultCategoryDropdownFilter } from '../VaultCategoryFilters';
import { CheckboxFilter } from '../CheckboxFilter';
import { ShownVaultsCount } from './ShownVaultsCount';

const useStyles = makeStyles(styles);

export type ExtendedFiltersProps = {
  desktopView: boolean;
};
export const ExtendedFilters = memo<ExtendedFiltersProps>(function ({ desktopView }) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.extendedFilters}>
      <ShownVaultsCount className={classes.shownVaultsCount} />
      <CheckboxFilter
        className={classes.checkbox}
        filter="onlyRetired"
        label={t('Filter-Retired')}
      />
      <CheckboxFilter className={classes.checkbox} filter="onlyPaused" label={t('Filter-Paused')} />
      <CheckboxFilter className={classes.checkbox} filter="onlyBoosted" label={t('Filter-Boost')} />
      <CheckboxFilter
        className={classes.checkbox}
        filter="onlyMoonpot"
        label={t('Filter-Moonpot')}
        icon={
          <img
            src={require('../../../../../../images/partners/pots.svg').default}
            alt=""
            width={20}
            height={20}
          />
        }
      />
      {!desktopView ? <VaultCategoryDropdownFilter className={classes.select} /> : null}
      <PlatformDropdownFilter className={classes.select} />
    </div>
  );
});
