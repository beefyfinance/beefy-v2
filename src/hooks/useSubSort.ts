import { useCallback, useMemo } from 'react';
import type {
  SortType,
  SortWithSubSort,
  SubSortsState,
} from '../features/data/reducers/filtered-vaults-types.ts';
import { useAppDispatch, useAppSelector } from '../features/data/store/hooks.ts';
import {
  selectFilterEffectiveSort,
  selectFilterSubSort,
} from '../features/data/selectors/filtered-vaults.ts';
import { AVG_APY_PERIODS } from '../helpers/apy.ts';
import { filteredVaultsActions } from '../features/data/reducers/filtered-vaults.ts';
import { useTranslation } from 'react-i18next';

type SubColumnValuesMap = {
  [K in SortWithSubSort]: { label: string; value: SubSortsState[K] }[];
};

const SUB_COLUMNS = {
  apy: [
    { label: 'Filter-SortApy-default', value: 'default' },
    ...AVG_APY_PERIODS.map(period => ({
      label: `Filter-SortApy-avg${period}d`,
      value: period,
    })),
  ],
} as const satisfies SubColumnValuesMap;

export function hasSubSort(columnKey: SortType): columnKey is SortWithSubSort {
  return SUB_COLUMNS[columnKey as SortWithSubSort] !== undefined;
}

export function useSubSort(columnKey: SortWithSubSort) {
  const { t } = useTranslation();
  const sortField = useAppSelector(selectFilterEffectiveSort);
  const parentSelected = sortField === columnKey;
  const value = useAppSelector(state => selectFilterSubSort(state, columnKey));
  const entries = SUB_COLUMNS[columnKey];
  const dispatch = useAppDispatch();
  const index = useMemo(() => entries.findIndex(key => key.value === value), [value, entries]);
  if (index === -1) {
    throw new Error(`Invalid sub value ${value} of column: ${columnKey}`);
  }
  const entry = entries[index];
  const nextIndex = (index + 1) % entries.length;
  const nextEntry = entries[nextIndex];

  const next = useCallback(() => {
    dispatch(
      filteredVaultsActions.update({
        subSort: { [columnKey]: nextEntry.value },
      })
    );
  }, [columnKey, nextEntry, dispatch]);

  return useMemo(
    () => ({ value: entry.value, label: t(entry.label), next, parentSelected }),
    [t, entry, next, parentSelected]
  );
}
