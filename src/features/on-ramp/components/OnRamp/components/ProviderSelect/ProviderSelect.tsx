import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectIsCheapestProviderSelected,
  selectQuoteProviders,
  selectSelectedQuote,
} from '../../../../../data/selectors/on-ramp';
import clsx from 'clsx';
import ContentLoader from 'react-content-loader';
import { ProviderIcon } from '../ProviderIcon';
import { useTranslation } from 'react-i18next';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';
import { PROVIDERS } from '../../providers';
import { ChevronRight } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export type ProviderSelectProps = { pending: boolean };
export const ProviderSelect = memo<ProviderSelectProps>(function ({ pending }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const quote = useAppSelector(selectSelectedQuote);
  const providers = useAppSelector(selectQuoteProviders);
  const multipleProviders = useMemo(() => providers && providers.length > 1, [providers]);
  const isCheapest = useAppSelector(selectIsCheapestProviderSelected);
  const canSwitchProvider = useMemo(
    () => !pending && multipleProviders,
    [pending, multipleProviders]
  );
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectProvider }));
  }, [dispatch]);

  return (
    <div className={classes.container}>
      <div className={classes.label}>
        {t(isCheapest ? 'OnRamp-BestRateVia' : 'OnRamp-SelectedRateVia')}
      </div>
      <button
        onClick={canSwitchProvider ? handleClick : undefined}
        className={clsx(
          classes.button,
          canSwitchProvider ? classes.clickable : classes.unclickable
        )}
      >
        <div className={clsx(classes.icon, pending ? classes.iconLoading : classes.iconProvider)}>
          {quote && quote.provider ? <ProviderIcon provider={quote.provider} /> : null}
        </div>
        {pending ? (
          <ContentLoader
            viewBox="0 0 152 16"
            width="152"
            height="16"
            backgroundColor="rgba(255, 255, 255, 0.12)"
            foregroundColor="rgba(255, 255, 255, 0.32)"
          >
            <rect x="0" y="0" rx="8" ry="8" width="152" height="16" />
          </ContentLoader>
        ) : (
          <>
            <div className={classes.provider}>{PROVIDERS[quote.provider].title}</div>
            <div className={classes.rate}>
              1 {quote.token} = {(1 / quote.rate).toFixed(2)} {quote.fiat}
            </div>
            {multipleProviders ? <ChevronRight className={classes.arrow} /> : null}
          </>
        )}
      </button>
    </div>
  );
});
