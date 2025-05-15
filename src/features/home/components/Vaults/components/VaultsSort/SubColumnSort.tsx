import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  type FilteredVaultsState,
  type SetSubSortPayload,
  type SortWithSubSort,
} from '../../../../../data/reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterSubSort } from '../../../../../data/selectors/filtered-vaults.ts';

export type FilterSubColumn<T extends SortWithSubSort> = {
  label: string;
  value: FilteredVaultsState['subSort'][T];
};

export type SubColumnSortProps<T extends SortWithSubSort> = {
  columnSelected: boolean;
  columnKey: T;
  subColumns: FilterSubColumn<T>[];
};

export const SubColumnSort = memo(function SubColumnSort<T extends SortWithSubSort>({
  columnSelected,
  columnKey,
  subColumns,
}: SubColumnSortProps<T>) {
  const { t } = useTranslation();
  const subKey = useAppSelector(state => selectFilterSubSort(state, columnKey));
  const dispatch = useAppDispatch();
  const index = useMemo(
    () => subColumns.findIndex(key => key.value === subKey),
    [subKey, subColumns]
  );
  if (index === -1) {
    throw new Error(`Invalid subKey: ${subKey} of column: ${columnKey}`);
  }

  const handleClick = useCallback(() => {
    const nextIndex = (index + 1) % subColumns.length;
    const value = subColumns[nextIndex].value;
    dispatch(filteredVaultsActions.setSubSort({ column: columnKey, value } as SetSubSortPayload));
  }, [columnKey, index, subColumns, dispatch]);

  return (
    <SortButton data-active={columnSelected || undefined} onClick={handleClick}>
      {t(subColumns[index].label)}
    </SortButton>
  );
});

const SortButton = styled('button', {
  base: {
    background: 'none',
    border: 'none',
    padding: '0',
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'flex',
    textDecoration: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: 'text.dark',
    _hover: {
      color: 'text.light',
    },
    _active: {
      color: 'text.light',
    },
  },
});
