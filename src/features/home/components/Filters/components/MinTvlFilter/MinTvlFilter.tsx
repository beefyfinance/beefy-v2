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
import { useBreakpoint } from '../../../../../../hooks/useBreakpoint.ts';
import { useDebouncedState } from '../../../../../../hooks/useDebouncedState.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';

//5 MILLION
const MAX_INPUT = new BigNumber(50000000);

const bigNumberEq = (a: BigNumber, b: BigNumber) => a.eq(b);

export const MinTvlFilter = memo(function MinTvlFilter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const storeValue = useAppSelector(state => selectFilterBigNumber(state, 'minimumUnderlyingTvl'));
  const isDesktop = useBreakpoint({ from: 'lg' });

  const maximumUnderlyingTvl = useAppSelector(selectMaximumUnderlyingVaultTvl);

  // Slider drags at pointer speed against `value`; the store write is debounced.
  const [value, setValue] = useDebouncedState(
    storeValue,
    next => dispatch(filteredVaultsActions.update({ minimumUnderlyingTvl: next })),
    { wait: 150, isEqual: bigNumberEq }
  );

  const handleChange = useCallback(
    (next: BigNumber) =>
      setValue(BigNumber.min(BigNumber.max(next, BIG_ZERO), maximumUnderlyingTvl)),
    [setValue, maximumUnderlyingTvl]
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
