import { css, type CssStyles } from '@repo/styles/css';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import {
  selectInputAmount,
  selectNetwork,
  selectOutputAmount,
  selectToken,
} from '../../../../../data/selectors/on-ramp.ts';
import { AmountInput } from '../AmountInput/AmountInput.tsx';
import { AmountLabel } from '../AmountLabel/AmountLabel.tsx';
import { AmountOutput } from '../AmountOutput/AmountOutput.tsx';
import { TokenAmountAdornment } from '../TokenAmountAdornment/TokenAmountAdornment.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type TokenAmountProps = {
  isInput: boolean;
  css?: CssStyles;
};
export const TokenAmount = memo(function TokenAmount({ isInput, css: cssProp }: TokenAmountProps) {
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
    <div className={css(cssProp)}>
      <AmountLabel css={styles.label}>{t('OnRamp-YouBuy')}</AmountLabel>
      {isInput ?
        <AmountInput
          value={inputValue}
          onChange={setValue}
          maxDecimals={8}
          endAdornment={<TokenAmountAdornment token={token} />}
        />
      : <AmountOutput
          value={outputValue}
          maxDecimals={8}
          endAdornment={<TokenAmountAdornment token={token} />}
        />
      }
      <div className={classes.network}>
        <div className={classes.networkLabel}>network:</div>
        <button type="button" className={classes.networkButton} onClick={handleNetworkClick}>
          {networkSrc ?
            <img
              src={networkSrc}
              width={20}
              height={20}
              alt={network}
              className={classes.networkIcon}
            />
          : null}
          {chain.name}
        </button>
      </div>
    </div>
  );
});
