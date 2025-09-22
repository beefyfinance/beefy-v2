import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShownVaultsCount } from './ShownVaultsCount.tsx';
import { CheckboxFilter } from '../CheckboxFilter/CheckboxFilter.tsx';
import { MinTvlFilter } from '../MinTvlFilter/MinTvlFilter.tsx';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';
import { BoostCheckBox } from '../BoostFilter/BoostFilterButton.tsx';
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
  const { t } = useTranslation();

  return (
    <>
      <ChainsContentButton handleContent={handleContent} />
      <PlatformsButton handleContent={handleContent} />
      <MobileContentBox>
        <BoostCheckBox />
      </MobileContentBox>
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
        <CheckboxFilter filter="onlyZappable" label={t('Filter-Zappable')} />
        <CheckboxFilter filter="onlyEarningPoints" label={t('Filter-Points')} />
        <CheckboxFilter filter="onlyRetired" label={t('Filter-Retired')} />
        <CheckboxFilter filter="onlyPaused" label={t('Filter-Paused')} />
      </MobileContentBox>
    </>
  );
});

export const DesktopFilter = memo<FilterContentProps>(function DesktopFilter({ handleContent }) {
  const { t } = useTranslation();

  return (
    <>
      <ShownVaultsCount />
      <PlatformsButton handleContent={handleContent} />
      <div>
        <CheckboxFilter filter="onlyZappable" label={t('Filter-Zappable')} />
        <CheckboxFilter filter="onlyEarningPoints" label={t('Filter-Points')} />
        <CheckboxFilter filter="onlyRetired" label={t('Filter-Retired')} />
        <CheckboxFilter filter="onlyPaused" label={t('Filter-Paused')} />
      </div>
      <MinTvlFilter />
    </>
  );
});
