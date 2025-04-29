import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShownVaultsCount } from './ShownVaultsCount.tsx';
import { CheckboxFilter } from '../CheckboxFilter/CheckboxFilter.tsx';
import { MinTvlFilter } from '../MinTvlFilter/MinTvlFilter.tsx';
import { FilterContent } from './ExtendedFilters.tsx';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { styled } from '@repo/styles/jsx';
import ArrowBackIcon from '../../../../../../images/icons/chevron-right.svg?react';
import { useAppSelector } from '../../../../../../store.ts';
import {
  selectFilterChainIds,
  selectFilterPlatformIds,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { PlatformDropdownFilter } from '../PlatformFilters/PlatformDropdownFilter.tsx';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms.ts';
import { selectAllChains } from '../../../../../data/selectors/chains.ts';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';
import { ChainDropdownFilter } from '../ChainFilters/ChainDropdownFilter.tsx';
import { BoostCheckBox } from '../BoostFilter/BoostFilterButton.tsx';

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
      <PlatformsButton handleContent={handleContent} />
      <ChainsContentButton handleContent={handleContent} />
      <MobileContentBoxes>
        <BoostCheckBox />
      </MobileContentBoxes>
      <MobileContentBoxes>
        <MinTvlFilter />
      </MobileContentBoxes>
      <MobileContentBoxes>
        <CheckboxFilter filter="onlyZappable" label={t('Filter-Zappable')} />
        <CheckboxFilter filter="onlyEarningPoints" label={t('Filter-Points')} />
        <CheckboxFilter filter="onlyRetired" label={t('Filter-Retired')} />
        <CheckboxFilter filter="onlyPaused" label={t('Filter-Paused')} />
      </MobileContentBoxes>
    </>
  );
});

export const DesktopFilter = memo<FilterContentProps>(function DesktopFilter({ handleContent }) {
  const { t } = useTranslation();

  return (
    <>
      <ShownVaultsCount />
      <PlatformsButton handleContent={handleContent} />
      <CheckboxFilter filter="onlyZappable" label={t('Filter-Zappable')} />
      <CheckboxFilter filter="onlyEarningPoints" label={t('Filter-Points')} />
      <CheckboxFilter filter="onlyRetired" label={t('Filter-Retired')} />
      <CheckboxFilter filter="onlyPaused" label={t('Filter-Paused')} />
      <MinTvlFilter />
    </>
  );
});

export const Chains = memo<FilterContentProps>(function Chains({ handleContent }) {
  const { t } = useTranslation();
  return (
    <>
      <ContentHeader>
        <ArrowBack onClick={() => handleContent(FilterContent.Filter)} />
        <Title>{t('Chains')}</Title>
      </ContentHeader>
      <ChainDropdownFilter />
    </>
  );
});

export const Platforms = memo<FilterContentProps>(function Platforms({ handleContent }) {
  const { t } = useTranslation();
  return (
    <>
      <ContentHeader>
        <ArrowBack onClick={() => handleContent(FilterContent.Filter)} />
        <Title>{t('Platforms')}</Title>
      </ContentHeader>
      <PlatformDropdownFilter />
    </>
  );
});

const PlatformsButton = memo<FilterContentProps>(function PlatformsButton({ handleContent }) {
  const { t } = useTranslation();

  const platforms = useAppSelector(selectFilterPlatforms);
  const platformsIds = useAppSelector(selectFilterPlatformIds);

  const platformLabel = useMemo(() => {
    if (platformsIds.length === 1) {
      return platforms.filter(p => p.id === platformsIds[0])[0];
    }
    return null;
  }, [platforms, platformsIds]);

  const label = useMemo(() => {
    return (
      platformsIds.length === 0 ? t('All')
      : platformsIds.length === 1 && platformLabel ? platformLabel.name
      : t('Select-CountSelected', { count: platformsIds.length })
    );
  }, [platformLabel, platformsIds.length, t]);

  return (
    <ButtonPlatforms
      size="sm"
      borderless={true}
      variant="filter"
      onClick={() => handleContent(FilterContent.Platform)}
    >
      <PlatformLabelContainer>
        {t('Filter-Platform')} <Label>{label}</Label>
      </PlatformLabelContainer>
      <ArrowBackIcon />
    </ButtonPlatforms>
  );
});

const ChainsContentButton = memo<FilterContentProps>(function ChainsContentButton({
  handleContent,
}) {
  const { t } = useTranslation();

  const allChainsById = useAppSelector(selectAllChains);

  const selectedChainIds = useAppSelector(selectFilterChainIds);

  console.log(allChainsById);

  const chainNameLabel = useMemo(() => {
    if (selectedChainIds.length === 1) {
      return allChainsById.filter(c => c.id === selectedChainIds[0])[0];
    }
    return null;
  }, [allChainsById, selectedChainIds]);

  const label = useMemo(() => {
    return (
      selectedChainIds.length === 0 ? t('All')
      : selectedChainIds.length === 1 && chainNameLabel ? chainNameLabel.name
      : t('Filter-ChainMultiple')
    );
  }, [selectedChainIds.length, t, chainNameLabel]);

  return (
    <ButtonPlatforms
      size="sm"
      borderless={true}
      variant="filter"
      onClick={() => handleContent(FilterContent.Chains)}
    >
      <PlatformLabelContainer>
        {t('Filter-Chain')} <Label>{label}</Label>
      </PlatformLabelContainer>
      <ArrowBackIcon />
    </ButtonPlatforms>
  );
});

const PlatformLabelContainer = styled('div', {
  base: {
    display: 'flex',
    gap: '4px',
  },
});

const Label = styled('span', {
  base: {
    color: 'text.light',
  },
});

const ButtonPlatforms = styled(Button, {
  base: {
    justifyContent: 'space-between',
  },
});

const Title = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.middle',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingRight: '8px',
  },
});

const ArrowBack = styled(ArrowBackIcon, {
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

const ContentHeader = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },
});

const MobileContentBoxes = styled('div', {
  base: {
    background: 'background.content.dark',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
});
