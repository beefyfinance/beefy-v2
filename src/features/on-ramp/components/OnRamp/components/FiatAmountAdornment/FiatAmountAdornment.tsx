import { memo, useCallback } from 'react';
import { CurrencyFlag } from '../CurrencyFlag/CurrencyFlag.tsx';
import { ButtonAdornment } from '../ButtonAdornment/ButtonAdornment.tsx';
import { useAppDispatch } from '../../../../../../store.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';

export type FiatAmountAdornmentProps = {
  currencyCode: string;
};
export const FiatAmountAdornment = memo(function FiatAmountAdornment({
  currencyCode,
}: FiatAmountAdornmentProps) {
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectFiat }));
  }, [dispatch]);

  return (
    <ButtonAdornment onClick={handleClick}>
      <CurrencyFlag currencyCode={currencyCode} />
      {currencyCode}
    </ButtonAdornment>
  );
});
