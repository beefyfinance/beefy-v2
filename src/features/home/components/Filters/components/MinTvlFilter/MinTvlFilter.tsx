import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { memo, useCallback } from 'react';
import {
  selectFilterBigNumber,
  selectMaximumUnderlyingVaultTvl,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import BigNumber from 'bignumber.js';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import { SliderInput } from '../../../../../../components/Form/Input/SliderInput.tsx';
import { styled } from '@repo/styles/jsx';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';

//5 MILLION
const MAX_INPUT = new BigNumber(50000000);

export const MinTvlFilter = memo(function MinTvlFilter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const value = useAppSelector(state => selectFilterBigNumber(state, 'minimumUnderlyingTvl'));
  const isDesktop = useBreakpoint({ from: 'lg' });

  const maximumUnderlyingTvl = useAppSelector(selectMaximumUnderlyingVaultTvl);

  const handleChange = useCallback(
    (value: BigNumber) => {
      dispatch(
        filteredVaultsActions.setBigNumber({
          filter: 'minimumUnderlyingTvl',
          value: BigNumber.min(BigNumber.max(value, BIG_ZERO), maximumUnderlyingTvl),
        })
      );
    },
    [dispatch, maximumUnderlyingTvl]
  );

  return (
    <Container>
      <Label>
        {t('Filter-MinTvl')}
        {value.gt(BIG_ZERO) && <Amount>{formatLargeUsd(value)}</Amount>}
      </Label>
      <SliderInput
        onChange={handleChange}
        value={value}
        maxValue={MAX_INPUT}
        size={isDesktop ? 'sm' : 'md'}
      />
      <div />
    </Container>
  );
});

const Label = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.dark',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

const Amount = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.light',
  },
});

const Container = styled('div', {
  base: {
    paddingBlock: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    lg: {
      paddingBlock: '0px',
    },
  },
});
