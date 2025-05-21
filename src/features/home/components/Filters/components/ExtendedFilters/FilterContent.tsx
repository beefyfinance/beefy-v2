import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShownVaultsCount } from './ShownVaultsCount.tsx';
import { CheckboxFilter } from '../CheckboxFilter/CheckboxFilter.tsx';
import { MinTvlFilter } from '../MinTvlFilter/MinTvlFilter.tsx';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { styled } from '@repo/styles/jsx';
import ArrowBackIcon from '../../../../../../images/icons/chevron-right.svg?react';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';

import { BoostCheckBox } from '../BoostFilter/BoostFilterButton.tsx';
import { StategyTypeCheckBoxList } from '../StrategyTypeFilters/StategyTypeCheckboxList.tsx';
import { VaultCategoryCheckList } from '../VaultCategoryFilters/VaultCategoryCheckList.tsx';
import { AssetTypeCheckList } from '../AssetTypeFilters/AssetTypeCheckList.tsx';
import { PlatformsButton } from './PlatformsContent.tsx';
import { ChainsContentButton } from './ChainsContent.tsx';
import type { FilterContent } from '../../../../../data/reducers/filtered-vaults-types.ts';

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

export const ButtonLabelContainer = styled('div', {
  base: {
    display: 'flex',
    gap: '4px',
  },
});

export const Label = styled('span', {
  base: {
    color: 'text.light',
  },
});

export const ButtonFilter = styled(Button, {
  base: {
    justifyContent: 'space-between',
    paddingBlock: '14px',
    paddingInline: '16px',
    lg: {
      paddingBlock: '8px',
      paddingInline: '12px',
    },
  },
});

export const Title = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.middle',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingRight: '8px',
  },
});

export const ArrowBack = styled(ArrowBackIcon, {
  base: {
    transform: 'rotate(180deg)',
    color: 'text.dark',
    height: '12px',
    _hover: {
      cursor: 'pointer',
      color: 'text.middle',
    },
  },
});

export const ContentHeader = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },
});

export const MobileContentBox = styled('div', {
  base: {
    background: 'background.content.dark',
    borderRadius: '8px',
    padding: '6px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  variants: {
    size: {
      sm: {
        padding: '4px 16px',
      },
    },
  },
});

export const MobileContentContainer = styled('div', {
  base: {
    backgroundColor: 'background.content.dark',
    borderRadius: '8px',
    height: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
});

export const IconContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20px',
    width: '20px',
  },
});
