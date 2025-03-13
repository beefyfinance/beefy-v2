import { memo, useCallback } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { CurrencyFlag } from '../CurrencyFlag/CurrencyFlag.tsx';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { useAppDispatch } from '../../../../../../store.ts';

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
