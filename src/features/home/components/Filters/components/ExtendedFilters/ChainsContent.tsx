import { ButtonLabelContainer } from './FilterContent.tsx';
import { ChainCheckList } from '../ChainFilters/ChainCheckList.tsx';
import { memo, useMemo } from 'react';
import { selectFilterChainIds } from '../../../../../data/selectors/filtered-vaults.ts';
import {
  ButtonFilter,
  Label,
  MobileContentContainer,
  IconContainer,
  type FilterContentProps,
} from './FilterContent.tsx';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectAllChains } from '../../../../../data/selectors/chains.ts';
import ArrowBackIcon from '../../../../../../images/icons/chevron-right.svg?react';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { FilterContent } from '../../../../../data/reducers/filtered-vaults-types.ts';
export const Chains = memo<FilterContentProps>(function Chains() {
  return (
    <Scrollable autoHeight={true}>
      <MobileContentContainer>
        <ChainCheckList />
      </MobileContentContainer>
    </Scrollable>
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
      : t('Select-CountSelected', { count: selectedChainIds.length })
    );
  }, [selectedChainIds.length, t, chainNameLabel]);

  return (
    <ButtonFilter
      borderless={true}
      variant="filter"
      onClick={() => handleContent(FilterContent.Chains)}
    >
      <ButtonLabelContainer>
        {t('Filter-Chain')} <Label>{label}</Label>
      </ButtonLabelContainer>
      <IconContainer>
        <ArrowBackIcon />
      </IconContainer>
    </ButtonFilter>
  );
});
