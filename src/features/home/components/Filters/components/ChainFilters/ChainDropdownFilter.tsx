import { memo, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectActiveChains } from '../../../../../data/selectors/chains.ts';
import { useTranslation } from 'react-i18next';
import { type CssStyles, cva } from '@repo/styles/css';
import { getNetworkIcon, useSelectedChainIds } from './hooks.tsx';
import { SelectMultiple } from '../../../../../../components/Form/Select/Multi/SelectMultiple.tsx';
import type { OptionIconProps } from '../../../../../../components/Form/Select/types.ts';

type ChainOption = {
  value: ChainEntity['id'];
  label: string;
};

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

const OptionIcon = memo(function OptionIcon({
  item,
  selected,
  noneSelected,
}: OptionIconProps<ChainOption>) {
  const Icon = getNetworkIcon(item.value);
  return <Icon className={iconRecipe({ selected: selected || noneSelected })} />;
});

export type ChainDropdownFilterProps = {
  css?: CssStyles;
};
export const ChainDropdownFilter = memo(function ChainDropdownFilter() {
  const dispatch = useAppDispatch();
  const activeChains = useAppSelector(selectActiveChains);
  const selectedChainIds = useSelectedChainIds();
  const { t } = useTranslation();

  const handleChange = useCallback(
    (selected: ChainEntity['id'][]) => {
      dispatch(
        filteredVaultsActions.setChainIds(selected.length === activeChains.length ? [] : selected)
      );
    },
    [dispatch, activeChains]
  );

  const options = useMemo(() => {
    return activeChains
      .map(chain => ({
        value: chain.id,
        label: chain.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [activeChains]);

  return (
    <SelectMultiple
      labelPrefix={t('Filter-Chain')}
      onChange={handleChange}
      options={options}
      selected={selectedChainIds}
      variant="filter"
      OptionIconComponent={OptionIcon}
      allSelectedLabel={t('Select-AllSelected')}
      layer={1}
    />
  );
});
