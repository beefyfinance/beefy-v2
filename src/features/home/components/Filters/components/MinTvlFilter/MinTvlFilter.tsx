import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectFilterBigNumber } from '../../../../../data/selectors/filtered-vaults.ts';
import { selectMaximumUnderlyingVaultTvl } from '../../../../../data/selectors/vaults.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import BigNumber from 'bignumber.js';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import { SliderInput } from '../../../../../../components/Form/Input/SliderInput.tsx';
import { styled } from '@repo/styles/jsx';
import { useTranslation } from 'react-i18next';

export const MinTvlFilter = memo(function MinTvlFilter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const value = useAppSelector(state => selectFilterBigNumber(state, 'minimumUnderlyingTvl'));

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
      <SliderInput onChange={handleChange} value={value} maxValue={maximumUnderlyingTvl} />
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
    textStyle: 'inherit',
    color: 'text.light',
  },
});

const Container = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
});
