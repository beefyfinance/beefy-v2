import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectAvgApySort } from '../../../../../data/selectors/filtered-vaults.ts';
import { useTranslation } from 'react-i18next';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { type AvgApySortType } from '../../../../../data/reducers/filtered-vaults-types.ts';
//temp remove 30/90 d
const sortOptions: AvgApySortType[] = ['default', 'avg7d'];

export const ApyAvgSort = memo(function ApyAvgSort() {
  const { t } = useTranslation();
  const avgApySort = useAppSelector(selectAvgApySort);
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    const currentIndex = sortOptions.indexOf(avgApySort);
    const nextIndex = (currentIndex + 1) % sortOptions.length;

    dispatch(filteredVaultsActions.setAvgApySort(sortOptions[nextIndex]));
  }, [avgApySort, dispatch]);

  const label = useMemo(() => {
    return t(`Filter-AvgApy-${avgApySort}`);
  }, [avgApySort, t]);

  const isActive = useMemo(() => {
    return avgApySort !== 'default';
  }, [avgApySort]);

  return (
    <ApyAvgSortButton alwaysActive={isActive} onClick={handleClick}>
      {label}
    </ApyAvgSortButton>
  );
});

export const ApyAvgSortButton = styled('button', {
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
    '&:hover': {
      color: 'text.light',
    },
  },
  variants: {
    alwaysActive: {
      true: {
        color: 'text.light',
      },
    },
  },
});
