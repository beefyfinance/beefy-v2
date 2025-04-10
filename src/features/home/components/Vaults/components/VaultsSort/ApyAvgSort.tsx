import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import {
  selectAvgApySort,
  selectFilterSearchSortField,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { useTranslation } from 'react-i18next';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { type AvgApySortType } from '../../../../../data/reducers/filtered-vaults-types.ts';
const sortOptions: AvgApySortType[] = ['default', 'avg7d', 'avg30d', 'avg90d'];

export const ApyAvgSort = memo(function ApyAvgSort() {
  const { t } = useTranslation();
  const avgApySort = useAppSelector(selectAvgApySort);
  const sortField = useAppSelector(selectFilterSearchSortField);
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    const currentIndex = sortOptions.indexOf(avgApySort);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    if (sortField !== 'apy') {
      dispatch(filteredVaultsActions.setSortFieldAndDirection({ field: 'apy', direction: 'desc' }));
    }

    dispatch(filteredVaultsActions.setAvgApySort(sortOptions[nextIndex]));
  }, [avgApySort, dispatch, sortField]);

  const label = useMemo(() => {
    return t(`Filter-AvgApy-${avgApySort}`);
  }, [avgApySort, t]);

  return <ApyAvgSortButton onClick={handleClick}>{label}</ApyAvgSortButton>;
});

export const ApyAvgSortButton = styled('button', {
  base: {
    background: 'none',
    border: 'none',
    padding: '0',
    textStyle: 'subline.sm',
    color: 'text.light',
    display: 'flex',
    textDecoration: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: 'text.dark',
  },
});
