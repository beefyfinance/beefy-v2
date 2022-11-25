import React from 'react';
import { Box, FormControl, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { StatLoader } from '../../../StatLoader';
import { useTheme } from '@material-ui/core/styles';
import {
  selectEns,
  selectIsBalanceHidden,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../../features/data/selectors/wallet';
import { BeefyState } from '../../../../redux-types';
import {
  askForWalletConnection,
  doDisconnectWallet,
  getEns,
} from '../../../../features/data/actions/wallet';
import { selectIsWalletPending } from '../../../../features/data/selectors/data-loader';
import clsx from 'clsx';
import { useAppDispatch } from '../../../../store';
import { formatAddressShort, formatEns } from '../../../../helpers/format';

const useStyles = makeStyles(styles);

export const WalletContainer = connect((state: BeefyState) => {
  const isWalletConnected = selectIsWalletConnected(state);
  const isWalletKnown = selectIsWalletKnown(state);
  const walletAddress = isWalletKnown ? selectWalletAddress(state) : null;
  const walletPending = selectIsWalletPending(state);
  const walletProfileUrl = state.user.wallet.profilePictureUrl;
  const blurred = selectIsBalanceHidden(state);
  const ens = selectEns(state);
  return { isWalletConnected, walletAddress, walletPending, walletProfileUrl, blurred, ens };
})(
  ({
    isWalletConnected,
    walletAddress,
    walletPending,
    walletProfileUrl,
    blurred,
    ens,
  }: {
    isWalletConnected: boolean;
    walletAddress: null | string;
    walletPending: boolean;
    walletProfileUrl: null | string;
    blurred: boolean;
    ens: string | null;
  }) => {
    const theme = useTheme();
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const handleWalletConnect = () => {
      if (walletAddress) {
        dispatch(doDisconnectWallet());
      } else {
        dispatch(askForWalletConnection());
      }
    };

    const formControlProps = {
      noValidate: true,
      autoComplete: 'off',
      onClick: handleWalletConnect,
    };

    React.useEffect(() => {
      if (walletAddress) {
        dispatch(getEns({ address: walletAddress }));
      }
    }, [dispatch, walletAddress]);

    return (
      <Box
        className={clsx({
          [classes.container]: true,
          [classes.known]: !!walletAddress,
          [classes.connected]: isWalletConnected,
          [classes.disconnected]: !walletAddress,
        })}
      >
        <FormControl {...formControlProps}>
          <div>
            {walletPending ? (
              <Box className={classes.loading}>
                <StatLoader
                  foregroundColor={theme.palette.primary.light}
                  backgroundColor={theme.palette.primary.dark}
                />
              </Box>
            ) : (
              <React.Fragment>
                <div className={clsx(classes.address, { [classes.blurred]: blurred })}>
                  {walletAddress
                    ? ens
                      ? formatEns(ens)
                      : formatAddressShort(walletAddress)
                    : t('Network-ConnectWallet')}
                </div>
              </React.Fragment>
            )}
          </div>
        </FormControl>
      </Box>
    );
  }
);
