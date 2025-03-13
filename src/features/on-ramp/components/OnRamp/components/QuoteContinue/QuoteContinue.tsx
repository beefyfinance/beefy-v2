import { memo, useCallback } from 'react';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectCanQuote, selectHaveQuote } from '../../../../../data/selectors/on-ramp.ts';
import { QuoteBest } from '../QuoteBest/QuoteBest.tsx';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { useTranslation } from 'react-i18next';

export type QuoteContinueProps = {
  css?: CssStyles;
};
export const QuoteContinue = memo(function QuoteContinue({ css: cssProp }: QuoteContinueProps) {
  const canQuote = useAppSelector(selectCanQuote);
  const haveQuote = useAppSelector(selectHaveQuote);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleContinue = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.InjectProvider }));
  }, [dispatch]);

  return (
    <div className={css(styles.container, cssProp)}>
      {canQuote ? <QuoteBest /> : null}
      <Button
        variant="success"
        disabled={!canQuote || !haveQuote}
        fullWidth={true}
        borderless={true}
        onClick={handleContinue}
      >
        {t('OnRamp-Continue')}
      </Button>
    </div>
  );
});
