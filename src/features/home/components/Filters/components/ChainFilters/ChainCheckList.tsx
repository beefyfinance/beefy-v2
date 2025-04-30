import { memo, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectActiveChains } from '../../../../../data/selectors/chains.ts';
import { selectFilterChainIds } from '../../../../../data/selectors/filtered-vaults.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { MultipleSelectContent } from '../../../../../../components/Form/Select/Multi/MultipleSelectContent.tsx';
import { getNetworkIcon } from './hooks.tsx';
import { cva } from '@repo/styles/css';

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
  const Icon = getNetworkIcon(item.value);
  return <Icon className={iconRecipe({ selected: selected || noneSelected })} />;
});

export const ChainCheckList = memo(function ChainCheckList() {
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
    <MultipleSelectContent
      options={options}
      selected={selectedChainIds}
      activeIndex={activeIndex}
      allSelected={allSelected}
      noneSelected={noneSelected}
      getItemProps={getItemProps}
      setListRefs={setListRefs}
      searchEnabled={true}
      OptionIconComponent={ChainOptionIcon}
    />
  );
});
