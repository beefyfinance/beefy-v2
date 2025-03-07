import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { PlatformDropdownFilter } from '../PlatformFilters/PlatformDropdownFilter.tsx';
import { styles } from './styles.ts';
import { VaultCategoryDropdownFilter } from '../VaultCategoryFilters/VaultCategoryDropdownFilter.tsx';
import { CheckboxFilter } from '../CheckboxFilter/CheckboxFilter.tsx';
import { ShownVaultsCount } from './ShownVaultsCount.tsx';
import { AssetTypeDropdownFilter } from '../AssetTypeFilters/AssetTypeDropdownFilter.tsx';
import { MinTvlFilter } from '../MinTvlFilter/MinTvlFilter.tsx';
import { StrategyTypeDropdownFilter } from '../StrategyTypeFilters/StrategyTypeDropdownFilter.tsx';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';

const useStyles = legacyMakeStyles(styles);

export type ExtendedFiltersProps = {
  desktopView: boolean;
};
export const ExtendedFilters = memo(function ExtendedFilters({
  desktopView,
}: ExtendedFiltersProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const mobileView = useBreakpoint({ to: 'xs' });
  const platformFilterPlacement = mobileView ? 'top-start' : 'bottom-start';

  return (
    <div className={classes.extendedFilters}>
      <ShownVaultsCount css={styles.shownVaultsCount} />
      <CheckboxFilter filter="onlyBoosted" label={t('Filter-Boost')} />
      <CheckboxFilter filter="onlyEarningPoints" label={t('Filter-Points')} />
      <CheckboxFilter filter="onlyZappable" label={t('Filter-Zappable')} />
      <CheckboxFilter filter="onlyRetired" label={t('Filter-Retired')} />
      <CheckboxFilter filter="onlyPaused" label={t('Filter-Paused')} />
      <MinTvlFilter />
      {!desktopView ? (
        <>
          <VaultCategoryDropdownFilter layer={1} />
          <AssetTypeDropdownFilter layer={1} />
          <StrategyTypeDropdownFilter layer={1} />
        </>
      ) : null}
      <PlatformDropdownFilter placement={platformFilterPlacement} />
    </div>
  );
});
