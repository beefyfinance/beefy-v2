import React from 'react';
import { Box, FormControl, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { StatLoader } from '../../../StatLoader';
import { useTheme } from '@material-ui/core/styles';
import {
  selectIsBalanceHidden,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../../features/data/selectors/wallet';
import type { BeefyState } from '../../../../redux-types';
import {
  askForWalletConnection,
  doDisconnectWallet,
} from '../../../../features/data/actions/wallet';
import { selectIsWalletPending } from '../../../../features/data/selectors/data-loader';
import clsx from 'clsx';
import { useAppDispatch } from '../../../../store';
import { formatAddressShort, formatDomain } from '../../../../helpers/format';
import { useResolveAddress } from '../../../../features/data/hooks/resolver';
import { isFulfilledStatus } from '../../../../features/data/reducers/wallet/resolver-types';

const useStyles = makeStyles(styles);

export const WalletContainer = connect((state: BeefyState) => {
  const isWalletConnected = selectIsWalletConnected(state);
  const isWalletKnown = selectIsWalletKnown(state);
  const walletAddress = isWalletKnown ? selectWalletAddress(state) : null;
  const walletPending = selectIsWalletPending(state);
  const blurred = selectIsBalanceHidden(state);
  return { isWalletConnected, walletAddress, walletPending, blurred };
})(
  ({
    isWalletConnected,
    walletAddress,
    walletPending,
    blurred,
  }: {
    isWalletConnected: boolean;
    walletAddress: null | string;
    walletPending: boolean;
    blurred: boolean;
  }) => {
    const theme = useTheme();
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const resolverStatus = useResolveAddress(walletAddress);

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
                    ? isFulfilledStatus(resolverStatus)
                      ? formatDomain(resolverStatus.value)
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
