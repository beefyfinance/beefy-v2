import { css } from '@repo/styles/css';
import { memo, useCallback, useMemo } from 'react';
import ContentLoader from 'react-content-loader';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import ChevronRight from '../../../../../../images/icons/mui/ChevronRight.svg?react';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import {
  selectIsCheapestProviderSelected,
  selectQuoteProviders,
  selectSelectedQuoteOrUndefined,
} from '../../../../../data/selectors/on-ramp.ts';
import { PROVIDERS } from '../../providers.tsx';
import { ProviderIcon } from '../ProviderIcon/ProviderIcon.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type ProviderSelectProps = {
  pending: boolean;
};
export const ProviderSelect = memo(function ProviderSelect({ pending }: ProviderSelectProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const quote = useAppSelector(selectSelectedQuoteOrUndefined);
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
        type="button"
        onClick={canSwitchProvider ? handleClick : undefined}
        className={css(styles.button, canSwitchProvider ? styles.clickable : styles.unclickable)}
      >
        <div className={css(styles.icon, pending && styles.iconLoading)}>
          {quote && quote.provider ?
            <ProviderIcon provider={quote.provider} />
          : null}
        </div>
        {pending ?
          <ContentLoader
            viewBox="0 0 152 16"
            width="152"
            height="16"
            backgroundColor="rgba(255, 255, 255, 0.12)"
            foregroundColor="rgba(255, 255, 255, 0.32)"
          >
            <rect x="0" y="0" rx="8" ry="8" width="152" height="16" />
          </ContentLoader>
        : !quote ?
          <>No quote found</>
        : <>
            <div className={classes.provider}>{PROVIDERS[quote.provider].title}</div>
            <div className={classes.rate}>
              1 {quote.token} = {(1 / quote.rate).toFixed(2)} {quote.fiat}
            </div>
            {multipleProviders ?
              <ChevronRight className={classes.arrow} />
            : null}
          </>
        }
      </button>
    </div>
  );
});
