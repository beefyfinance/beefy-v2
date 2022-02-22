import { memo, useCallback } from 'react';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { selectIsWalletConnected, selectWalletAddress } from '../../../data/selectors/wallet';
import { actions as filteredVaultActions } from '../../../data/reducers/filtered-vaults';
import { BeefyState } from '../../../../redux-types';
import { askForWalletConnection, doDisconnectWallet } from '../../../data/actions/wallet';

const useStyles = makeStyles(styles as any);
const _EmptyStates = connect((state: BeefyState) => {
  const isWalletConnected = selectIsWalletConnected(state);
  const walletAddress = isWalletConnected ? selectWalletAddress(state) : null;
  return { isWalletConnected, walletAddress };
})(
  ({ isWalletConnected, walletAddress }: { isWalletConnected: boolean; walletAddress: string }) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const dispatch = useDispatch();
    const handleWalletConnect = () => {
      if (walletAddress) {
        dispatch(doDisconnectWallet());
      } else {
        dispatch(askForWalletConnection());
      }
    };

    const handleReset = useCallback(() => dispatch(filteredVaultActions.reset()), [dispatch]);

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
            {isWalletConnected ? t('EmptyStates-NoDeposited') : t('EmptyStates-NoConnected')}
          </Typography>
        </Box>
        <Box>
          {isWalletConnected ? (
            <Button className={classes.btn} onClick={handleReset}>
              {t('EmptyStates-Browse')}
            </Button>
          ) : (
            <Button className={classes.btn} onClick={handleWalletConnect}>
              {t('EmptyStates-Connect')}
            </Button>
          )}
        </Box>
      </Box>
    );
  }
);

export const EmptyStates = memo(_EmptyStates);
