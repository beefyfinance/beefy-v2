import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShownVaultsCount } from './ShownVaultsCount.tsx';
import { CheckboxFilter } from '../CheckboxFilter/CheckboxFilter.tsx';
import { MinTvlFilter } from '../MinTvlFilter/MinTvlFilter.tsx';
import { useBreakpoint } from '../../../../../../hooks/useBreakpoint.ts';
import { StategyTypeCheckBoxList } from '../StrategyTypeFilters/StategyTypeCheckboxList.tsx';
import { VaultCategoryCheckList } from '../VaultCategoryFilters/VaultCategoryCheckList.tsx';
import { AssetTypeCheckList } from '../AssetTypeFilters/AssetTypeCheckList.tsx';
import { PlatformsButton } from './PlatformsContent.tsx';
import { ChainsContentButton } from './ChainsContent.tsx';
import type { FilterContent } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { MobileContentBox } from './FilterContainers.tsx';

export interface FilterContentProps {
  handleContent: (content: FilterContent) => void;
}

export const Filter = memo<FilterContentProps>(function Filter({ handleContent }) {
  const desktop = useBreakpoint({ from: 'lg' });

  return desktop ?
      <DesktopFilter handleContent={handleContent} />
    : <MobileFilter handleContent={handleContent} />;
});

export const MobileFilter = memo<FilterContentProps>(function MobileFilter({ handleContent }) {
  return (
    <>
      <ChainsContentButton handleContent={handleContent} />
      <PlatformsButton handleContent={handleContent} />
      <MobileContentBox>
        <VaultCategoryCheckList />
      </MobileContentBox>
      <MobileContentBox>
        <AssetTypeCheckList />
      </MobileContentBox>
      <MobileContentBox>
        <StategyTypeCheckBoxList />
      </MobileContentBox>
      <MobileContentBox size="sm">
        <MinTvlFilter />
      </MobileContentBox>
      <MobileContentBox>
        <OnlyFilters />
      </MobileContentBox>
    </>
  );
});

export const DesktopFilter = memo<FilterContentProps>(function DesktopFilter({ handleContent }) {
  return (
    <>
      <ShownVaultsCount />
      <PlatformsButton handleContent={handleContent} />
      <div>
        <OnlyFilters />
      </div>
      <MinTvlFilter />
    </>
  );
});

const OnlyFilters = memo(function OnlyFilters() {
  const { t } = useTranslation();
  return (
    <>
      <CheckboxFilter filter="onlyZappable" label={t('Filter-Zappable')} />
      <CheckboxFilter filter="onlyBoosted" label={t('Filter-Boosted')} />
      <CheckboxFilter filter="onlyEarningPoints" label={t('Filter-Points')} />
      <CheckboxFilter filter="onlyRetired" label={t('Filter-Retired')} />
      <CheckboxFilter filter="onlyPaused" label={t('Filter-Paused')} />
    </>
  );
});
