import { css, type CssStyles } from '@repo/styles/css';
import { memo, useCallback } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch } from '../../../../../data/store/hooks.ts';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { CurrencyFlag } from '../CurrencyFlag/CurrencyFlag.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type FiatTitleAdornmentProps = {
  currencyCode: string;
  css?: CssStyles;
};
export const FiatTitleAdornment = memo(function TokenIconAdornment({
  currencyCode,
  css: cssProp,
}: FiatTitleAdornmentProps) {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectFiat }));
  }, [dispatch]);

  return (
    <button type="button" className={css(styles.fiatAdornment, cssProp)} onClick={handleClick}>
      <CurrencyFlag currencyCode={currencyCode} className={classes.flag} />
      {currencyCode}
    </button>
  );
});
