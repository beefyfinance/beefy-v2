import { memo, useCallback } from 'react';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import {
  selectIsWalletInitialized,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../data/selectors/wallet';
import { filteredVaultsActions } from '../../../data/reducers/filtered-vaults';
import { BeefyState } from '../../../../redux-types';
import { askForWalletConnection, doDisconnectWallet } from '../../../data/actions/wallet';

const useStyles = makeStyles(styles as any);
const _EmptyStates = connect((state: BeefyState) => {
  const isWalletKnown = selectIsWalletKnown(state);
  const isWalletInitialized = selectIsWalletInitialized(state);
  const walletAddress = isWalletKnown ? selectWalletAddress(state) : null;
  return { isWalletKnown, walletAddress, isWalletInitialized };
})(
  ({
    isWalletKnown,
    isWalletInitialized,
    walletAddress,
  }: {
    isWalletKnown: boolean;
    isWalletInitialized: boolean;
    walletAddress: string;
  }) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const dispatch = useDispatch();
    const handleWalletConnect = useCallback(() => {
      if (walletAddress) {
        dispatch(doDisconnectWallet());
      } else {
        dispatch(askForWalletConnection());
      }
    }, [dispatch, walletAddress]);

    const handleReset = useCallback(() => dispatch(filteredVaultsActions.reset()), [dispatch]);

    return (
      <Box className={classes.itemContainer}>
        <Box>
          <img
            height={120}
            alt="BIFI"
            src={require(`../../../../images/empty-state.svg`).default}
          />
        </Box>
        <Box>
          <Typography className={classes.bold} variant="h5">
            {t('EmptyStates-OhSnap')}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" className={classes.text}>
            {isWalletKnown ? t('EmptyStates-NoDeposited') : t('EmptyStates-NoConnected')}
          </Typography>
        </Box>
        <Box>
          {isWalletKnown ? (
            <Button className={classes.btn} onClick={handleReset}>
              {t('EmptyStates-Browse')}
            </Button>
          ) : isWalletInitialized ? (
            <Button className={classes.btn} onClick={handleWalletConnect}>
              {t('EmptyStates-Connect')}
            </Button>
          ) : null}
        </Box>
      </Box>
    );
  }
);

export const EmptyStates = memo(_EmptyStates);
