import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectTransactInputIndexAmount } from '../../../../../data/selectors/transact';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { type AmountInputProps } from '../AmountInput';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { BigNumber } from 'bignumber.js';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens';
import { AmountInputWithSlider } from '../AmountInputWithSlider';
import { TokenSelectButton } from '../TokenSelectButton';
import type { TokenEntity } from '../../../../../data/entities/token';

export type DepositTokenAmountInputProps = {
  index: number;
  token: TokenEntity;
  className?: string;
};

export const DepositTokenAmountInput = memo<DepositTokenAmountInputProps>(
  function DepositTokenAmountInput({ index, token, className }) {
    const dispatch = useAppDispatch();
    const userBalance = useAppSelector(state =>
      selectUserBalanceOfToken(state, token.chainId, token.address)
    );
    const value = useAppSelector(state => selectTransactInputIndexAmount(state, index));
    const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, token.oracleId));

    const handleChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
      (value, isMax) => {
        dispatch(
          transactActions.setInputAmount({
            index,
            amount: value.decimalPlaces(token.decimals, BigNumber.ROUND_FLOOR),
            max: isMax,
          })
        );
      },
      [dispatch, token.decimals, index]
    );

    return (
      <AmountInputWithSlider
        className={className}
        value={value}
        price={price}
        maxValue={userBalance}
        onChange={handleChange}
        selectedToken={token}
        endAdornment={<TokenSelectButton index={index} />}
      />
    );
  }
);
