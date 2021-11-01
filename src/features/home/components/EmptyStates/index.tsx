import React, { memo } from 'react';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { FILTER_DEFAULT } from '../../hooks/useFilteredVaults';
import { useDispatch, useSelector } from 'react-redux';
import { reduxActions } from '../../../redux/actions';
import { EmptyStatesProps } from './EmptyStatesProps';

const useStyles = makeStyles(styles);

const _EmptyStates: React.FC<EmptyStatesProps> = ({ setFilterConfig }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();

  const walletReducer = useSelector(state => state.walletReducer);
  const isConnected = React.useMemo(
    () => (walletReducer.address ? true : false),
    [walletReducer.address]
  );

  const handleWalletConnect = () => {
    if (!walletReducer.address) {
      dispatch(reduxActions.wallet.connect());
    } else {
      dispatch(reduxActions.wallet.disconnect());
    }
  };

  const handleReset = React.useCallback(() => {
    setFilterConfig(FILTER_DEFAULT);
  }, [setFilterConfig]);

  return (
    <Box className={classes.itemContainer}>
      <Box>
        <img height={120} alt="BIFI" src={require('images/empty-state.svg').default} />
      </Box>
      <Box>
        <Typography className={classes.bold} component="h5">
          {t('EmptyStates-OhSnap')}
        </Typography>
      </Box>
      <Box>
        <Typography className={classes.text}>
          {isConnected ? t('EmptyStates-NoDeposited') : t('EmptyStates-NoConnected')}
        </Typography>
      </Box>
      <Box>
        {isConnected ? (
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
