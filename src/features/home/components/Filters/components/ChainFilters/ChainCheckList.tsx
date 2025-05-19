import { memo, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectActiveChains, selectChainById } from '../../../../../data/selectors/chains.ts';
import { selectFilterChainIds } from '../../../../../data/selectors/filtered-vaults.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { SelectMultipleContent } from '../../../../../../components/Form/Select/Multi/SelectMultipleContent.tsx';
import { getNetworkIcon } from './hooks.ts';
import { cva } from '@repo/styles/css';
import { useTranslation } from 'react-i18next';
import { NewBadge } from '../../../../../../components/Badges/NewBadge.tsx';
import { styled } from '@repo/styles/jsx';

const iconRecipe = cva({
  base: {
    width: '24px',
    height: '24px',
  },
  variants: {
    selected: {
      false: {
        '& .bg': {
          fill: 'chainIconUnselectedBackground',
        },
        '& .fg': {
          fill: 'background.body',
        },
      },
    },
  },
});

const ChainOptionIcon = memo(function ChainOptionIcon({
  item,
  selected,
  noneSelected,
}: {
  item: { value: ChainEntity['id'] };
  selected: boolean;
  noneSelected: boolean;
}) {
  const chain = useAppSelector(state => selectChainById(state, item.value));
  const Icon = getNetworkIcon(chain.id);
  return (
    <ChainOptionIconContainer>
      {chain.new && <NewBadge />}
      <Icon className={iconRecipe({ selected: selected || noneSelected })} />
    </ChainOptionIconContainer>
  );
});

export const ChainCheckList = memo(function ChainCheckList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeChains = useAppSelector(selectActiveChains);
  const selectedChainIds = useAppSelector(selectFilterChainIds);
  const [activeIndex] = useState<number | null>(null);

  const options = useMemo(
    () =>
      activeChains
        .map(chain => ({
          label: chain.name,
          value: chain.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [activeChains]
  );

  const handleChange = useCallback(
    (selected: ChainEntity['id'][]) => {
      dispatch(
        filteredVaultsActions.setChainIds(selected.length === activeChains.length ? [] : selected)
      );
    },
    [dispatch, activeChains]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      onClick: () => {
        const option = options[index];
        if (option) {
          const newSelected =
            selectedChainIds.includes(option.value) ?
              selectedChainIds.filter(id => id !== option.value)
            : [...selectedChainIds, option.value];
          handleChange(newSelected);
        }
      },
    }),
    [options, selectedChainIds, handleChange]
  );

  const setListRefs = useMemo(
    () =>
      Array.from({ length: options.length }, () => () => {
        // We don't need to store refs for this implementation
      }),
    [options.length]
  );

  const allSelected = selectedChainIds.length === options.length;
  const noneSelected = selectedChainIds.length === 0;

  return (
    <SelectMultipleContent
      options={options}
      selected={selectedChainIds}
      activeIndex={activeIndex}
      allSelected={allSelected}
      noneSelected={noneSelected}
      getItemProps={getItemProps}
      setListRefs={setListRefs}
      searchEnabled={true}
      OptionEndAdornmentComponent={ChainOptionIcon}
      placeholder={t('Filter-Chains-Search-Placeholder')}
    />
  );
});

const ChainOptionIconContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
});
