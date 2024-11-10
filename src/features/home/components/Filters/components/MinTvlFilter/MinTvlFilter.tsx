import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { memo, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectFilterBigNumber,
  selectFilterBoolean,
} from '../../../../../data/selectors/filtered-vaults';
import { AmountInputWithSlider } from '../../../../../vault/components/Actions/Transact/AmountInputWithSlider';
import { selectMaximumUnderlyingVaultTvl } from '../../../../../data/selectors/vaults';
import { BIG_ONE, BIG_ZERO } from '../../../../../../helpers/big-number';
import { BigNumber } from 'bignumber.js';
import { formatLargeUsd } from '../../../../../../helpers/format';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

const DEFAULT_MAX_TVL = new BigNumber(3_000_000);

export const MinTvlFilter = memo(function MinTvlFilter() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const value = useAppSelector(state => selectFilterBigNumber(state, 'minimumUnderlyingTvl'));
  const show = useAppSelector(state => selectFilterBoolean(state, 'showMinimumUnderlyingTvl'));
  const showLarge = useAppSelector(state =>
    selectFilterBoolean(state, 'showMinimumUnderlyingTvlLarge')
  );
  const maximumUnderlyingTvl = useAppSelector(selectMaximumUnderlyingVaultTvl);

  // By default, only show up to DEFAULT_MAX_TVL (more practical UX for most cases)
  // Provide a checkbox to let users see the larger TVL options
  const maxShownTvl = useMemo(
    () => (showLarge ? maximumUnderlyingTvl : DEFAULT_MAX_TVL),
    [maximumUnderlyingTvl, showLarge]
  );

  const handleChange = useCallback(
    (value: BigNumber) => {
      dispatch(
        filteredVaultsActions.setBigNumber({
          filter: 'minimumUnderlyingTvl',
          value: BigNumber.min(BigNumber.max(value, BIG_ZERO), maxShownTvl),
        })
      );
    },
    [dispatch, maxShownTvl]
  );

  const handleShowToggle = useCallback(() => {
    dispatch(
      filteredVaultsActions.setBoolean({
        filter: 'showMinimumUnderlyingTvl',
        value: !show,
      })
    );
  }, [show, dispatch]);

  const handleShowLargeToggle = useCallback(() => {
    dispatch(
      filteredVaultsActions.setBoolean({
        filter: 'showMinimumUnderlyingTvlLarge',
        value: !showLarge,
      })
    );
  }, [showLarge, dispatch]);

  return (
    <>
      <LabelledCheckbox
        label={t('Filter-MinTvl')}
        onChange={handleShowToggle}
        checked={show}
        checkboxClass={classes.checkbox}
      />
      {show && (
        <div className={classes.amountContainer}>
          <AmountInputWithSlider
            value={value}
            maxValue={maxShownTvl}
            onChange={handleChange}
            selectedToken={{ decimals: 10 }}
            price={BIG_ONE}
            endAdornment={<span>{formatLargeUsd(maxShownTvl)}</span>}
          />
          <LabelledCheckbox
            label={t('Filter-MinTvlLarge')}
            onChange={handleShowLargeToggle}
            checked={showLarge}
            checkboxClass={classes.largeTvlCheckbox}
          />
        </div>
      )}
    </>
  );
});
