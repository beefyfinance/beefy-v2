import { ArrowBack, ButtonLabelContainer } from './FilterContent.tsx';
import { ChainCheckList } from '../ChainFilters/ChainCheckList.tsx';
import { memo, useMemo } from 'react';
import { selectFilterChainIds } from '../../../../../data/selectors/filtered-vaults.ts';
import {
  ButtonFilter,
  ContentHeader,
  Label,
  MobileContentContainer,
  Title,
  type FilterContentProps,
} from './FilterContent.tsx';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store.ts';
import { selectAllChains } from '../../../../../data/selectors/chains.ts';
import { FilterContent } from './types.ts';
import ArrowBackIcon from '../../../../../../images/icons/chevron-right.svg?react';

export const Chains = memo<FilterContentProps>(function Chains({ handleContent }) {
  const { t } = useTranslation();
  return (
    <>
      <ContentHeader>
        <ArrowBack onClick={() => handleContent(FilterContent.Filter)} />
        <Title>{t('Chains')}</Title>
      </ContentHeader>
      <MobileContentContainer>
        <ChainCheckList />
      </MobileContentContainer>
    </>
  );
});

export const ChainsContentButton = memo<FilterContentProps>(function ChainsContentButton({
  handleContent,
}) {
  const { t } = useTranslation();

  const allChainsById = useAppSelector(selectAllChains);

  const selectedChainIds = useAppSelector(selectFilterChainIds);

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
    <ButtonFilter
      size="lg"
      borderless={true}
      variant="filter"
      onClick={() => handleContent(FilterContent.Chains)}
    >
      <ButtonLabelContainer>
        {t('Filter-Chain')} <Label>{label}</Label>
      </ButtonLabelContainer>
      <ArrowBackIcon />
    </ButtonFilter>
  );
});
