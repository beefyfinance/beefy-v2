import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '../../../../../../components/Form/Select/Single/Select.tsx';
import type {
  SelectItem,
  SelectSingleProps,
} from '../../../../../../components/Form/Select/types.ts';
import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterSearchSortField } from '../../../../../data/selectors/filtered-vaults.ts';

export const DropdownSort = memo(function DropdownSort() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const value = useAppSelector(selectFilterSearchSortField);
  const options = useMemo<Array<SelectItem<FilteredVaultsState['sort']>>>(
    () => [
      { value: 'default', label: t('Filter-SortDefault') },
      { value: 'walletValue', label: t('Filter-SortWallet') },
      { value: 'depositValue', label: t('Filter-SortDeposited') },
      { value: 'apy', label: t('Filter-SortApy') },
      { value: 'daily', label: t('Filter-SortDaily') },
      { value: 'tvl', label: t('Filter-SortTvl') },
      { value: 'safetyScore', label: t('Filter-SortSafety') },
    ],
    [t]
  );

  const handleChange = useCallback<
    SelectSingleProps<SelectItem<FilteredVaultsState['sort']>>['onChange']
  >(
    value => {
      dispatch(filteredVaultsActions.setSort(value || 'default'));
    },
    [dispatch]
  );

  return (
    <Select
      labelPrefix={t('Filter-Sort')}
      selected={value}
      onChange={handleChange}
      options={options}
      borderless={true}
      fullWidth={true}
      variant="dark"
    />
  );
});
