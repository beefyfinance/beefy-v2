import { css, type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge.ts';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance.ts';
import {
  selectBridgeDepositTokenForChainId,
  selectBridgeFormState,
  selectBridgeSourceToken,
} from '../../../../../data/selectors/bridge.ts';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { AmountInputProps } from '../../../../../vault/components/Actions/Transact/AmountInput/AmountInput.tsx';
import { AmountInput } from '../../../../../vault/components/Actions/Transact/AmountInput/AmountInput.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type AmountSelectorProps = {
  css?: CssStyles;
};

export const AmountSelector = memo(function AmountSelector({ css: cssProp }: AmountSelectorProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { from, input } = useAppSelector(selectBridgeFormState);
  const sourceToken = useAppSelector(selectBridgeSourceToken);
  const fromToken = useAppSelector(state => selectBridgeDepositTokenForChainId(state, from));
  const userBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, fromToken.chainId, fromToken.address)
  );
  const price = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(
      state,
      // handle the fact that mooBIFI is a vault, so on etherum its oracle is BIFI not mooBIFI
      fromToken.chainId === sourceToken.chainId ? sourceToken.oracleId : fromToken.oracleId
    )
  );

  const handleMax = useCallback(() => {
    dispatch(
      bridgeActions.setInputAmount({
        amount: userBalance.decimalPlaces(fromToken.decimals, BigNumber.ROUND_FLOOR),
        max: true,
        token: fromToken,
      })
    );
  }, [dispatch, fromToken, userBalance]);

  const handleChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
    (value, isMax) => {
      dispatch(
        bridgeActions.setInputAmount({
          amount: value.decimalPlaces(fromToken.decimals, BigNumber.ROUND_FLOOR),
          max: isMax,
          token: fromToken,
        })
      );
    },
    [dispatch, fromToken]
  );

  const error = useMemo(() => {
    return input.amount.gt(userBalance);
  }, [input.amount, userBalance]);

  return (
    <div className={css(cssProp)}>
      <div className={classes.labels}>
        <div className={classes.label}>{t('AMOUNT')}</div>
        <div onClick={handleMax} className={classes.balance}>
          {t('Transact-Available')}{' '}
          <span>
            {formatTokenDisplayCondensed(userBalance, fromToken.decimals, 4)} {fromToken.symbol}
          </span>
        </div>
      </div>
      <AmountInput
        value={input.amount}
        maxValue={userBalance}
        tokenDecimals={input.token.decimals}
        onChange={handleChange}
        allowInputAboveBalance={true}
        error={error}
        price={price}
        endAdornment={<MaxButton disabled={userBalance.lte(BIG_ZERO)} onClick={handleMax} />}
      />
    </div>
  );
});

const MaxButton = memo(function MaxButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes.max}>
      {t('Transact-Max')}
    </button>
  );
});
