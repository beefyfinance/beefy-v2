import { makeStyles, useMediaQuery } from '@material-ui/core';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonLink } from '../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { askForWalletConnection, doDisconnectWallet } from '../../../data/actions/wallet';
import { selectWalletAddressIfKnown } from '../../../data/selectors/wallet';
import { Section } from '../../../../components/Section';
import { styles } from './styles';
import iconEmptyState from '../../../../images/empty-state.svg';
import { AddressInput } from '../AddressInput';
import type { Theme } from '@material-ui/core';
import { isValidAddress } from '../../../../helpers/addresses';
import { formatAddressShort } from '../../../../helpers/format';

const useStyles = makeStyles(styles);

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
        connectedAddress
          ? 'Dashboard-Text-InvalidAddress-Connected'
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
export const NoResults = memo<NoResultsProps>(function NoResults({ title, address }) {
  const { t } = useTranslation();
  const connectedAddress = useAppSelector(selectWalletAddressIfKnown);
  const requestForConnectedWallet = useMemo(() => {
    return address && connectedAddress && address.toLowerCase() === connectedAddress.toLowerCase();
  }, [address, connectedAddress]);

  return (
    <Error
      title={title}
      text={t(
        requestForConnectedWallet
          ? 'Dashboard-Text-NoData-ViewingConnected'
          : connectedAddress
          ? 'Dashboard-Text-NoData-Connected'
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
const Error = memo<ErrorProps>(function Error({ title, text, connectedAction = 'vaults' }) {
  const classes = useStyles();

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), { noSsr: true });

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
          {text ? <div className={classes.text}>{text}</div> : null}
        </div>
        <Actions connectedAction={connectedAction} />
      </div>
    </Section>
  );
});

type ActionProps = {
  connectedAction?: 'vaults' | 'dashboard';
};
const Actions = memo<ActionProps>(function Actions({ connectedAction }) {
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
        {connectedAddress ? (
          connectedAction === 'dashboard' ? (
            <ButtonLink
              className={classes.btn}
              to={`/dashboard/${connectedAddress}`}
              variant="success"
            >
              {t('NoResults-ViewConnectedDashboard')}
            </ButtonLink>
          ) : (
            <ButtonLink className={classes.btn} to="/" variant="success">
              {t('NoResults-ViewAllVaults')}
            </ButtonLink>
          )
        ) : (
          <Button className={classes.btn} onClick={handleWalletConnect} variant="success">
            {t('NoResults-ConnectWallet')}
          </Button>
        )}
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
