import { css } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAsync } from '../../../../../../helpers/useAsync.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectSelectedQuote } from '../../../../../data/selectors/on-ramp.ts';
import { selectWalletAddressIfKnown } from '../../../../../data/selectors/wallet.ts';
import { PROVIDERS } from '../../providers.tsx';
import { ErrorIndicator } from '../ErrorIndicator/ErrorIndicator.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export const ProviderFrame = memo(function ProviderFrame() {
  const classes = useStyles();
  const { t } = useTranslation();
  const quote = useAppSelector(selectSelectedQuote);
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const { useFetchUrl, title } = PROVIDERS[quote.provider];
  const fetchUrl = useFetchUrl(quote, walletAddress);
  const { value: url, error: urlError, status: urlStatus } = useAsync(fetchUrl, null);

  return (
    url ?
      quote.provider === 'transak' ?
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          title={title}
          className={classes.iframe}
          allow="payment"
        />
      : <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          title={title}
          className={css(styles.iframe, styles.iframeMtPellerin)}
          allow="usb; ethereum; clipboard-write; payment; microphone; camera"
          loading="lazy"
        />
    : urlError || (urlStatus === 'success' && !url) ?
      <ErrorIndicator
        css={styles.error}
        title={t('OnRamp-InjectProviderStep-Error', { provider: title })}
        content={urlError?.message || 'Unknown error'}
      />
    : <>
        {/* TODO set back to loading... */}
        <LoadingIndicator text={urlStatus} />
      </>
  );
});
