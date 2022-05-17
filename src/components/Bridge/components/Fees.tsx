import React from 'react';
import { makeStyles, Box, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import { BeefyState } from '../../../redux-types';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(styles as any);

function _FeesInfo() {
  const { t } = useTranslation();
  const classes = useStyles();

  const formState = useSelector((state: BeefyState) => state.ui.bridgeModal);

  return (
    <Box className={classes.fees}>
      <Box className={classes.feesContent}>
        {/*Crosschain */}
        <Box className={classes.feesItem}>
          <Typography className={classes.label} variant="body2">
            {t('Bridge-Crosschain')}
          </Typography>
          <Typography className={classes.value} variant="h5">
            {formState.destChainInfo.SwapFeeRatePerMillion}%
          </Typography>
        </Box>
        {/*Gas fee */}
        <Box className={classes.feesItem}>
          <Typography className={classes.label} variant="body2">
            {t('Bridge-Gas')}
          </Typography>
          <Typography className={classes.value} variant="h5">
            {formState.destChainInfo.MinimumSwapFee} BIFI
          </Typography>
        </Box>
        {/* Min Amount */}
        <Box className={classes.feesItem}>
          <Typography className={classes.label} variant="body2">
            {t('Bridge-MinAmount')}
          </Typography>
          <Typography className={classes.value} variant="h5">
            {formState.destChainInfo.MinimumSwap} BIFI
          </Typography>
        </Box>
        {/* Max Amount */}
        <Box className={classes.feesItem}>
          <Typography className={classes.label} variant="body2">
            {t('Bridge-MaxAmount')}
          </Typography>
          <Typography className={classes.value} variant="h5">
            {formState.destChainInfo.MaximumSwap} BIFI
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" className={classes.advice}>
        {t('Bridge-Advice-1')}
      </Typography>
      <Typography variant="body2" className={classes.advice1}>
        {t('Bridge-Advice-2')}
      </Typography>
    </Box>
  );
}

export const Fees = React.memo(_FeesInfo);
