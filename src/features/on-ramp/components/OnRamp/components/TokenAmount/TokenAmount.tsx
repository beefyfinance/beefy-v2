import React, { memo, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectInputAmount,
  selectNetwork,
  selectOutputAmount,
  selectToken,
} from '../../../../../data/selectors/on-ramp';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { AmountInput } from '../AmountInput';
import { TokenAmountAdornment } from '../TokenAmountAdornment';
import { AmountOutput } from '../AmountOutput';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc';
import { selectChainById } from '../../../../../data/selectors/chains';
import { AmountLabel } from '../AmountLabel';
import { useTranslation } from 'react-i18next';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';

const useStyles = makeStyles(styles);

export type TokenAmountProps = {
  isInput: boolean;
  className?: string;
};
export const TokenAmount = memo<TokenAmountProps>(function TokenAmount({ isInput, className }) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const classes = useStyles();
  const inputValue = useAppSelector(selectInputAmount);
  const outputValue = useAppSelector(selectOutputAmount);
  const token = useAppSelector(selectToken);
  const network = useAppSelector(selectNetwork);
  const chain = useAppSelector(state => selectChainById(state, network));
  const networkSrc = useMemo(() => getNetworkSrc(network), [network]);
  const setValue = useCallback(
    (value: number) => {
      dispatch(onRampFormActions.setInputAmount({ amount: value }));
    },
    [dispatch]
  );
  const handleNetworkClick = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectNetwork }));
  }, [dispatch]);

  return (
    <div className={className}>
      <AmountLabel className={classes.label}>{t('OnRamp-YouBuy')}</AmountLabel>
      {isInput ? (
        <AmountInput
          value={inputValue}
          onChange={setValue}
          maxDecimals={8}
          endAdornment={<TokenAmountAdornment token={token} />}
        />
      ) : (
        <AmountOutput
          value={outputValue}
          maxDecimals={8}
          endAdornment={<TokenAmountAdornment token={token} />}
        />
      )}
      <div className={classes.network}>
        <div className={classes.networkLabel}>network:</div>
        <button className={classes.networkButton} onClick={handleNetworkClick}>
          {networkSrc ? (
            <img
              src={networkSrc}
              width={20}
              height={20}
              alt={network}
              className={classes.networkIcon}
            />
          ) : null}
          {chain.name}
        </button>
      </div>
    </div>
  );
});
