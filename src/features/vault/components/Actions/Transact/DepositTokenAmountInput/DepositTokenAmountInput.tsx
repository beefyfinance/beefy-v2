import React, { memo, useCallback, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selecTransactForceSelection,
  selectTransactInputAmount,
  selectTransactSelected,
} from '../../../../../data/selectors/transact';
import clsx from 'clsx';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import type { AmountInputProps } from '../AmountInput';
import { AmountInput } from '../AmountInput';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import BigNumber from 'bignumber.js';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens';
import { TokenSelectButton } from '../TokenSelectButton';

const useStyles = makeStyles(styles);

export type DepositTokenAmountInputProps = {
  className?: string;
};

export const DepositTokenAmountInput = memo<DepositTokenAmountInputProps>(
  function DepositTokenAmountInput({ className }) {
    const [sliderValue, setSliderValue] = useState<number>(0);
    const dispatch = useAppDispatch();
    const classes = useStyles({ sliderValue });
    const selection = useAppSelector(selectTransactSelected);
    const depositToken = selection.tokens[0]; // TODO univ3; only 1 deposit token supported
    const userBalance = useAppSelector(state =>
      selectUserBalanceOfToken(state, depositToken.chainId, depositToken.address)
    );
    const value = useAppSelector(selectTransactInputAmount);
    const price = useAppSelector(state =>
      selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
    );
    const forceSelection = useAppSelector(selecTransactForceSelection);
    const handleChange = useCallback<AmountInputProps['onChange']>(
      (value, isMax) => {
        dispatch(
          transactActions.setInputAmount({
            amount: value.decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR),
            max: isMax,
          })
        );

        if (value.gt(userBalance)) {
          setSliderValue(100);
        } else {
          setSliderValue(value.times(100).dividedBy(userBalance).toNumber());
        }
      },
      [dispatch, depositToken.decimals, userBalance]
    );

    const handleSliderChange = useCallback(
      (value: number | string) => {
        console.log(value);
        const parsedNumber = new BigNumber(value).toNumber();
        setSliderValue(parsedNumber);

        dispatch(
          transactActions.setInputAmount({
            amount: userBalance
              .multipliedBy(parsedNumber / 100)
              .decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR),
            max: value === 100,
          })
        );
      },
      [depositToken.decimals, dispatch, userBalance]
    );

    const error = useMemo(() => {
      return value.gt(userBalance);
    }, [userBalance, value]);

    return (
      <div className={clsx(classes.inputContainer)}>
        <AmountInput
          className={clsx(classes.input, className)}
          errorClassName={classes.errorInput}
          value={value}
          maxValue={userBalance}
          tokenDecimals={depositToken.decimals}
          onChange={handleChange}
          error={error}
          allowInputAboveBalance={true}
          fullWidth={true}
          price={price}
          endAdornement={<TokenSelectButton />}
          disabled={forceSelection}
        />
        <input
          disabled={forceSelection}
          className={clsx(classes.slider, {
            [classes.sliderBackground]: !error,
            [classes.errorRange]: error,
          })}
          onChange={e => handleSliderChange(e.target.value)}
          value={sliderValue}
          type="range"
          min="1"
          max="100"
        />
        <div className={classes.dataList}>
          {[0, 25, 50, 75, 100].map(item => (
            <div
              className={item === sliderValue && !error ? classes.active : ''}
              onClick={() => handleSliderChange(item)}
              key={`index-${item}`}
            >{`${item}%`}</div>
          ))}
        </div>
      </div>
    );
  }
);
