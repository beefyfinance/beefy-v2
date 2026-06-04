import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AVG_APY_PERIODS } from '../../../../helpers/apy.ts';
import type { AvgApySortType } from '../../../data/reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../../../data/reducers/filtered-vaults.ts';
import { selectFilterAvgApySort } from '../../../data/selectors/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';

const APY_PERIODS: AvgApySortType[] = ['default', ...AVG_APY_PERIODS];

export const FeaturedVaultApyLabel = memo(function FeaturedVaultApyLabel() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const subSort = useAppSelector(selectFilterAvgApySort);

  const prefix = useMemo(() => {
    if (subSort === 'default') return t('Filter-SortApy-default-Featured');
    return t('Filter-SortApy-avgNd-Featured', { count: subSort });
  }, [t, subSort]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const idx = APY_PERIODS.indexOf(subSort);
      const next = APY_PERIODS[(idx + 1) % APY_PERIODS.length];
      dispatch(filteredVaultsActions.setSubSort({ column: 'apy', value: next }));
    },
    [dispatch, subSort]
  );

  return (
    <Label>
      <Prefix type="button" onClick={handleClick}>
        {prefix}
      </Prefix>
      <span>{t('VaultStat-APY')}</span>
    </Label>
  );
});

const Label = styled('div', {
  base: {
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'inline-flex',
    alignItems: 'baseline',
    columnGap: '4px',
  },
});

const Prefix = styled('button', {
  base: {
    background: 'none',
    border: 'none',
    padding: '0',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationColor: 'text.underline',
    textUnderlineOffset: '3px',
    _hover: {
      color: 'text.light',
    },
  },
});
