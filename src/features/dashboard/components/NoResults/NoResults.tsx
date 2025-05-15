import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../components/Button/Button.tsx';
import { ButtonLink } from '../../../../components/Button/ButtonLink.tsx';
import { useBreakpoint } from '../../../../components/MediaQueries/useBreakpoint.ts';
import { Section } from '../../../../components/Section/Section.tsx';
import { isValidAddress } from '../../../../helpers/addresses.ts';
import { formatAddressShort } from '../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import iconEmptyState from '../../../../images/empty-state.svg';
import { askForWalletConnection, doDisconnectWallet } from '../../../data/actions/wallet.ts';
import { selectWalletAddressIfKnown } from '../../../data/selectors/wallet.ts';
import { AddressInput } from '../AddressInput/AddressInput.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export const InvalidDomain = memo(function InvalidDomain() {
  const { t } = useTranslation();
  const connectedAddress = useAppSelector(selectWalletAddressIfKnown);

  return (
    <Error
      title={t('Dashboard-Title-InvalidDomain')}
      text={t(
        connectedAddress ? 'Dashboard-Text-InvalidDomain-Connected' : 'Dashboard-Text-InvalidDomain'
      )}
      connectedAction={'dashboard'}
    />
  );
});

export const InvalidAddress = memo(function InvalidAddress() {
  const { t } = useTranslation();
  const connectedAddress = useAppSelector(selectWalletAddressIfKnown);

  return (
    <Error
      title={t('Dashboard-Title-InvalidAddress')}
      text={t(
        connectedAddress ?
          'Dashboard-Text-InvalidAddress-Connected'
        : 'Dashboard-Text-InvalidAddress'
      )}
      connectedAction={'dashboard'}
    />
  );
});

export const NotConnected = memo(function NotConnected() {
  const { t } = useTranslation();
  return <Error title={t('Dashboard-Title-NoAddress')} text={t('Dashboard-Text-NoAddress')} />;
});

export type NoResultsProps = {
  title: string;
  address: string;
};
export const NoResults = memo(function NoResults({ title, address }: NoResultsProps) {
  const { t } = useTranslation();
  const connectedAddress = useAppSelector(selectWalletAddressIfKnown);
  const requestForConnectedWallet = useMemo(() => {
    return address && connectedAddress && address.toLowerCase() === connectedAddress.toLowerCase();
  }, [address, connectedAddress]);

  return (
    <Error
      title={title}
      text={t(
        requestForConnectedWallet ? 'Dashboard-Text-NoData-ViewingConnected'
        : connectedAddress ? 'Dashboard-Text-NoData-Connected'
        : 'Dashboard-Text-NoData'
      )}
      connectedAction={!requestForConnectedWallet ? 'dashboard' : 'vaults'}
    />
  );
});

type ErrorProps = {
  title: string;
  text: string;
  connectedAction?: 'vaults' | 'dashboard';
};
const Error = memo(function Error({ title, text, connectedAction = 'vaults' }: ErrorProps) {
  const classes = useStyles();

  const smDown = useBreakpoint({ to: 'sm' });

  const wrappedTitle = useMemo(() => {
    return smDown && isValidAddress(title) ? formatAddressShort(title) : title;
  }, [smDown, title]);

  return (
    <Section>
      <div className={classes.container}>
        <div>
          <img className={classes.icon} src={iconEmptyState} alt="empty" />
        </div>
        <div className={classes.textContainer}>
          <div className={classes.title}>{wrappedTitle}</div>
          {text ?
            <div className={classes.text}>{text}</div>
          : null}
        </div>
        <Actions connectedAction={connectedAction} />
      </div>
    </Section>
  );
});

type ActionProps = {
  connectedAction?: 'vaults' | 'dashboard';
};
const Actions = memo(function Actions({ connectedAction }: ActionProps) {
  const { t } = useTranslation();
  const connectedAddress = useAppSelector(selectWalletAddressIfKnown);
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const handleWalletConnect = useCallback(() => {
    if (connectedAddress) {
      dispatch(doDisconnectWallet());
    } else {
      dispatch(askForWalletConnection());
    }
  }, [dispatch, connectedAddress]);

  return (
    <div className={classes.actionsContainer}>
      <div className={classes.center}>
        {connectedAddress ?
          connectedAction === 'dashboard' ?
            <ButtonLink css={styles.btn} to={`/dashboard/${connectedAddress}`} variant="success">
              {t('NoResults-ViewConnectedDashboard')}
            </ButtonLink>
          : <ButtonLink css={styles.btn} to="/" variant="success">
              {t('NoResults-ViewAllVaults')}
            </ButtonLink>

        : <Button css={styles.btn} onClick={handleWalletConnect} variant="success">
            {t('NoResults-ConnectWallet')}
          </Button>
        }
      </div>
      <Divider />
      <AddressInput />
    </div>
  );
});

const Divider = memo(function Divider() {
  const classes = useStyles();
  return (
    <div className={classes.center}>
      <div className={classes.dividerContainer}>
        <div className={classes.line} />
        <div className={classes.or}>OR</div>
        <div className={classes.line} />
      </div>
    </div>
  );
});
