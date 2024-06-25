import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { memo, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterBigNumber } from '../../../../../data/selectors/filtered-vaults';
import { AmountInputWithSlider } from '../../../../../vault/components/Actions/Transact/AmountInputWithSlider';
import { getMaximumVaultTvl } from '../../../../../data/selectors/vaults';
import { BIG_ONE, BIG_ZERO } from '../../../../../../helpers/big-number';
import BigNumber from 'bignumber.js';
import { formatLargeUsd } from '../../../../../../helpers/format';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { useLocalStorageBoolean } from '../../../../../../helpers/useLocalStorageBoolean';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

export const MinTvlFilter = memo(function MinTvlFilter() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const value = useAppSelector(state => selectFilterBigNumber(state, 'minimumTotalSupply'));

  const [showLargeOptions, setShowLargeOptions] = useLocalStorageBoolean('show_large_tvls', false);
  const [shown, setShown] = useLocalStorageBoolean('show_tvl_slider', value.gt(0));

  const maximumTvlOfAllVaults = useAppSelector(getMaximumVaultTvl);

  // By default, only show up to 5M (more practical UX for most cases)
  // Provide a checkbox to let users see the larger TVL options
  const maxShownTvl = useMemo(
    () => (!showLargeOptions ? new BigNumber(3_000_000) : maximumTvlOfAllVaults),
    [maximumTvlOfAllVaults, showLargeOptions]
  );

  const handleChange = useCallback(
    (value: BigNumber) => {
      if (value.gt(maxShownTvl)) {
        value = maxShownTvl;
      } else if (value.lt(BIG_ZERO)) {
        value = BIG_ZERO;
      }
      dispatch(
        filteredVaultsActions.setBigNumber({
          filter: 'minimumTotalSupply',
          value: new BigNumber(value.toString()),
        })
      );
    },
    [dispatch, maxShownTvl]
  );

  const onSetShown = useCallback(() => {
    if (!shown) {
      setShown(true);
    } else {
      setShown(false);
      handleChange(BIG_ZERO);
    }
  }, [shown, handleChange, setShown]);

  const onSetShowLargeOptions = useCallback(() => {
    setShowLargeOptions(!showLargeOptions);
  }, [showLargeOptions, setShowLargeOptions]);

  return (
    <>
      <LabelledCheckbox
        label={t('Filter-MinTvl')}
        onChange={onSetShown}
        checked={shown}
        checkboxClass={classes.checkbox}
      />
      {!!shown && (
        <div className={classes.amountContainer}>
          <AmountInputWithSlider
            value={value}
            maxValue={maxShownTvl}
            onChange={handleChange}
            onSliderChange={v => handleChange(maxShownTvl.times(v / 100))}
            selectedToken={{ decimals: 10 }}
            price={BIG_ONE}
            endAdornment={<span>{formatLargeUsd(maxShownTvl)}</span>}
          />
          <LabelledCheckbox
            label={t('Filter-MinTvlLarge')}
            onChange={onSetShowLargeOptions}
            checked={showLargeOptions}
            checkboxClass={classes.largeTvlCheckbox}
          />
        </div>
      )}
    </>
  );
});
