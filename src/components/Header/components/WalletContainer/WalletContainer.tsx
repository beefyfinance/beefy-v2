import React from 'react';
import { Avatar, Box, FormControl, Grid, makeStyles, Typography } from '@material-ui/core';
import { styles } from './styles';
import { connect, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { StatLoader } from '../../../StatLoader';
import { useTheme } from '@material-ui/core/styles';
import {
  selectIsBalanceHidden,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../../features/data/selectors/wallet';
import { BeefyState } from '../../../../redux-types';
import {
  askForWalletConnection,
  doDisconnectWallet,
} from '../../../../features/data/actions/wallet';
import { selectIsWalletPending } from '../../../../features/data/selectors/data-loader';
import clsx from 'clsx';

const useStyles = makeStyles(styles as any);
const formatAddress = addr => {
  return addr.substr(0, 5) + '...' + addr.substr(addr.length - 5, 5);
};

export const WalletContainer = connect((state: BeefyState) => {
  const isWalletConnected = selectIsWalletConnected(state);
  const isWalletKnown = selectIsWalletKnown(state);
  const walletAddress = isWalletKnown ? selectWalletAddress(state) : null;
  const walletPending = selectIsWalletPending(state);
  const walletProfileUrl = state.user.wallet.profilePictureUrl;
  const blurred = selectIsBalanceHidden(state);
  return { isWalletConnected, walletAddress, walletPending, walletProfileUrl, blurred };
})(
  ({
    isWalletConnected,
    walletAddress,
    walletPending,
    walletProfileUrl,
    blurred,
  }: {
    isWalletConnected: boolean;
    walletAddress: null | string;
    walletPending: boolean;
    walletProfileUrl: null | string;
    blurred: boolean;
  }) => {
    const theme = useTheme();
    const classes = useStyles();
    const dispatch = useDispatch();
    const t = useTranslation().t;

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
          <Grid container direction="row" alignItems="center">
            {walletPending ? (
              <Box className={classes.loading}>
                <StatLoader
                  foregroundColor={theme.palette.primary.light}
                  backgroundColor={theme.palette.primary.dark}
                />
              </Box>
            ) : (
              <React.Fragment>
                {walletProfileUrl ? (
                  <Avatar className={clsx({ [classes.blurred]: blurred })} src={walletProfileUrl} />
                ) : (
                  ''
                )}
                <Typography
                  className={clsx({ [classes.blurred]: blurred })}
                  variant="body1"
                  noWrap={true}
                >
                  {walletAddress ? formatAddress(walletAddress) : t('Network-ConnectWallet')}
                </Typography>
              </React.Fragment>
            )}
          </Grid>
        </FormControl>
      </Box>
    );
  }
);
