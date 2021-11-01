import React, { useState } from 'react';
import { Box, Button, makeStyles, Typography, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import AnimateHeight from 'react-animate-height';
import styles from './styles';
import { Popover } from '../../../../components/Popover/Popover';

const useStyles = makeStyles(styles);

export const BoostWidget = ({ onClick, balance, s_stake }) => {
  const classes = useStyles();
  const t = useTranslation().t;
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
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
      <div className={classes.containerExpired}>
        <Box display="flex" alignItems="center" style={{ marginBottom: '24px' }}>
          <img alt="fire" src={require('images/fire.png').default} className={classes.boostImg} />
          <Typography className={classes.h1white}>{t('Boost-Expired')}</Typography>
          &nbsp;
          <Typography className={classes.h1}>{t('Boost-Noun')}</Typography>
          <Button
            className={classes.blockBtn}
            style={{ maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px' }}
            value={filterOpen}
            selected={filterOpen}
            children={
              !filterOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-chevron-down"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-chevron-up"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
                  />
                </svg>
              )
            }
            onClick={() => {
              setFilterOpen(!filterOpen);
            }}
          ></Button>
        </Box>
        {/* TODO: Map to expired boosts */}
        <AnimateHeight duration={500} height={filterOpen ? 'auto' : 0}>
          <div className={classes.expiredBoostContainer}>
            <Typography className={classes.h2} style={{ textTransform: 'none' }}>
              POTS&nbsp;{t('Filter-Boost')}
            </Typography>
            <Button
              disabled={false}
              className={classes.button}
              style={{ marginBottom: 0 }}
              fullWidth={true}
              onClick={onClick}
            >
              {t('Boost-Button-Claim-Unstake')}
            </Button>
          </div>
          <div className={classes.expiredBoostContainer}>
            <Typography className={classes.h2} style={{ textTransform: 'none' }}>
              PACOCA&nbsp;{t('Filter-Boost')}
            </Typography>
            <Button
              disabled={false}
              className={classes.button}
              style={{ marginBottom: 0 }}
              fullWidth={true}
              onClick={onClick}
            >
              {t('Boost-Button-Claim-Unstake')}
            </Button>
          </div>
        </AnimateHeight>
      </div>
    </>
  );
};
