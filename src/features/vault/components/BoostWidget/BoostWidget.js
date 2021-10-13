import React from 'react';
import { Box, Button, makeStyles, Typography, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './styles';
import Popover from 'components/Popover';

const useStyles = makeStyles(styles);

const BoostWidget = ({ onClick, balance, s_stake }) => {
  const classes = useStyles();
  const t = useTranslation().t;
  return (
    <div className={classes.container}>
      <Box display="flex" alignItems="center">
        <img alt="fire" src={require('images/fire.png').default} className={classes.boostImg} />
        <Typography className={classes.h1}>{t('Boost-Noun')}</Typography>
        <Box style={{ marginLeft: '8px' }}>
          <Popover
            title={t('Boost-WhatIs')}
            content={t('Boost-Explain')}
            solid
            size="md"
            placement="top-end"
          />
        </Box>
      </Box>
      {/* TODO: connect boost data + buttons*/}
      <Grid container>
        <Grid item xs={6}>
          <Typography className={classes.body1}>{t('Boost-Balance')}</Typography>
          <Typography className={classes.h2}>{balance}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.body1}>{t('Boost-Balance-Staked')}</Typography>
          <Typography className={classes.h2}>0</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.body1}>{t('Boost-Rewards')}</Typography>
          <Typography className={classes.h2}>0</Typography>
        </Grid>
      </Grid>

      <Button disabled={false} className={classes.button} fullWidth={true} onClick={onClick}>
        {t('Boost-Button-Vault')}
      </Button>
      <Button disabled={true} className={classes.button} fullWidth={true} onClick={onClick}>
        {t('Boost-Button-Withdraw')}
      </Button>
      <Button disabled={true} className={classes.button} fullWidth={true} onClick={onClick}>
        {t('Boost-Button-Claim')}
      </Button>
      <Button disabled={true} className={classes.button} fullWidth={true} onClick={onClick}>
        {t('Boost-Button-Claim-Unstake')}
      </Button>
    </div>
  );
};

export default BoostWidget;
