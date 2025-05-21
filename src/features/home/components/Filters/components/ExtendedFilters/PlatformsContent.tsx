import { PlatformChecklist } from '../PlatformFilters/PlatformCheckList.tsx';
import {
  ArrowBack,
  ButtonFilter,
  ButtonLabelContainer,
  ContentHeader,
  Label,
  MobileContentContainer,
  Title,
  IconContainer,
  type FilterContentProps,
} from './FilterContent.tsx';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterContent } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms.ts';
import { selectFilterPlatformIds } from '../../../../../data/selectors/filtered-vaults.ts';
import ArrowBackIcon from '../../../../../../images/icons/chevron-right.svg?react';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { styled } from '@repo/styles/jsx';

export const PlatformsButton = memo<FilterContentProps>(function PlatformsButton({
  handleContent,
}) {
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
    <ButtonFilter
      borderless={true}
      size="md"
      variant="filter"
      onClick={() => handleContent(FilterContent.Platform)}
    >
      <ButtonLabelContainer>
        {t('Filter-Platform')} <Label>{label}</Label>
      </ButtonLabelContainer>
      <IconContainer>
        <ArrowBackIcon />
      </IconContainer>
    </ButtonFilter>
  );
});

export const Platforms = memo<FilterContentProps>(function Platforms({ handleContent }) {
  const { t } = useTranslation();
  const isDesktop = useBreakpoint({ from: 'lg' });
  return (
    <>
      {isDesktop ?
        <ContentHeader>
          <BackButton onClick={() => handleContent(FilterContent.Filter)}>
            <ArrowBack />
          </BackButton>
          <Title>{t('Platforms')}</Title>
        </ContentHeader>
      : null}
      {isDesktop ?
        <DesktopPlatformsContent />
      : <MobilePlatformsContent />}
    </>
  );
});

export const MobilePlatformsContent = memo(function MobilePlatformsContent() {
  return (
    <Scrollable autoHeight={true}>
      <MobileContentContainer>
        <PlatformChecklist />
      </MobileContentContainer>
    </Scrollable>
  );
});

export const DesktopPlatformsContent = memo(function DesktopPlatformsContent() {
  return (
    <Scrollable autoHeight={340}>
      <ScrollableContainer>
        <PlatformChecklist />
      </ScrollableContainer>
    </Scrollable>
  );
});

const BackButton = styled('button', {
  base: {
    backgroundColor: 'transparent',
    border: 'none',
    height: '20px',
    width: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const ScrollableContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
    overflowY: 'auto',
    paddingBottom: '16px',
  },
});
