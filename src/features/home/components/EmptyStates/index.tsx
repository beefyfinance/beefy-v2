import { memo, useCallback } from 'react';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { reduxActions } from '../../../redux/actions';
import { selectIsWalletConnected } from '../../../data/selectors/wallet';
import { actions as filteredVaultActions } from '../../../data/reducers/filtered-vaults';

const useStyles = makeStyles(styles as any);
const _EmptyStates = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();
  const isWalletConnected = useSelector(selectIsWalletConnected);

  const handleWalletConnect = () => {
    if (!isWalletConnected) {
      dispatch(reduxActions.wallet.connect());
    } else {
      dispatch(reduxActions.wallet.disconnect());
    }
  };

  const handleReset = useCallback(() => dispatch(filteredVaultActions.reset()), [dispatch]);

  return (
    <Box className={classes.itemContainer}>
      <Box>
        <img height={120} alt="BIFI" src={require(`../../../../images/empty-state.svg`).default} />
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
};

export const EmptyStates = memo(_EmptyStates);
