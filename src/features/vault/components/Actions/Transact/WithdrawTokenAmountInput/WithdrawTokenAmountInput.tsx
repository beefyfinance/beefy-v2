import React, { memo, useCallback, useMemo, type CSSProperties } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selecTransactForceSelection,
  selectTransactInputAmount,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import clsx from 'clsx';
import { selectUserVaultDepositInDepositTokenExcludingBoostsBridged } from '../../../../../data/selectors/balance';
import type { AmountInputProps } from '../AmountInput';
import { AmountInput } from '../AmountInput';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import {
  selectTokenByAddress,
  selectTokenPriceByTokenOracleId,
} from '../../../../../data/selectors/tokens';
import BigNumber from 'bignumber.js';
import { TokenSelectButton } from '../TokenSelectButton';
import { BIG_ZERO } from '../../../../../../helpers/big-number';

const useStyles = makeStyles(styles);

export type WithdrawTokenAmountInputProps = {
  className?: string;
};

export const WithdrawTokenAmountInput = memo<WithdrawTokenAmountInputProps>(
  function WithdrawTokenAmountInput({ className }) {
    const dispatch = useAppDispatch();
    const classes = useStyles();
    const vaultId = useAppSelector(selectTransactVaultId);
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const depositToken = useAppSelector(state =>
      selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
    );
    const userBalance = useAppSelector(state =>
      selectUserVaultDepositInDepositTokenExcludingBoostsBridged(state, vaultId)
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
      },
      [dispatch, depositToken.decimals]
    );

    const handleSliderChange = useCallback(
      (value: number | string) => {
        const parsedNumber = new BigNumber(value).toNumber();

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

    const sliderValue = useMemo(() => {
      return value
        .times(100)
        .dividedBy(userBalance.gt(BIG_ZERO) ? userBalance : 1)
        .toNumber();
    }, [userBalance, value]);

    return (
      <div className={classes.inputContainer}>
        <AmountInput
          className={clsx(classes.input, className)}
          value={value}
          maxValue={userBalance}
          tokenDecimals={depositToken.decimals}
          onChange={handleChange}
          allowInputAboveBalance={true}
          fullWidth={true}
          error={error}
          price={price}
          endAdornment={<TokenSelectButton />}
          disabled={forceSelection}
        />
        <input
          disabled={forceSelection}
          className={clsx(classes.slider, {
            [classes.sliderBackground]: !error,
            [classes.errorRange]: error,
          })}
          style={{ '--value': `${sliderValue}%` } as CSSProperties}
          onChange={e => handleSliderChange(e.target.value)}
          value={sliderValue}
          type="range"
          min="1"
          max="100"
        />
        <div className={classes.dataList}>
          {[0, 25, 50, 75, 100].map(item => (
            <div
              className={clsx(classes.itemList, {
                [classes.active]: item === sliderValue && !error,
                [classes.itemDisabled]: forceSelection,
              })}
              onClick={() => handleSliderChange(item)}
              key={`index-${item}`}
            >{`${item}%`}</div>
          ))}
        </div>
      </div>
    );
  }
);
