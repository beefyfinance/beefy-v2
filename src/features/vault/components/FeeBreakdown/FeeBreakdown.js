import { Box, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import Popover from 'components/Popover';
import useFormattedFee from 'hooks/useFormattedFee';

const useStyles = makeStyles(styles);

const BreakdownTooltip = memo(({ rows }) => {
  const classes = useStyles();

  return (
    <>
      {rows.map(row => (
        <Box className={classes.rows} key={row.label}>
          <div className={row.last ? classes.bold : classes.labelTooltip}>{row.label}</div>
          <div className={row.last ? classes.bold : classes.valueTooltip}>{row.value}</div>
        </Box>
      ))}
    </>
  );
});

const PerformanceFees = memo(({ rates, vaultID }) => {
  const rows = [];
  const { t } = useTranslation();

  //TODO REMOVE WHEN CAN GET DYNAMIC DATA FROM ABOUT FEES
  const isCakeVault = vaultID === 'cake-cakev2';

  rows.push({
    label: t('Fee-Holder'),
    value: isCakeVault ? '1%' : '2.5%',
    last: false,
  });

  rows.push({
    label: t('Fee-Treasury'),
    value: isCakeVault ? '0%' : '1.5%',
    last: false,
  });

  rows.push({
    label: t('Fee-Developers'),
    value: isCakeVault ? '0%' : '0.5%',
    last: false,
  });

  rows.push({
    label: t('Fee-TotalFee'),
    value: isCakeVault ? '1%' : '4.5%',
    last: true,
  });

  return <BreakdownTooltip rows={rows} />;
});

const FeeBreakdown = ({ item, formData, type }) => {
  const classes = useStyles();
  const t = useTranslation().t;
  const formattedDepositFee = useFormattedFee(item.depositFee);
  const formattedWithdrawalFee = useFormattedFee(item.withdrawalFee);

  return (
    <Box mt={2} p={2} className={classes.feeContainer}>
      {console.log(item)}
      <Grid container>
        {formData.deposit.isZap ? (
          <Grid item xs={12}>
            <Typography className={classes.title} style={{ marginBottom: '12px' }}>
              {t('Zap-Title')}
            </Typography>
            {type === 'deposit' ? (
              <>
                <ol className={classes.ol}>
                  <li>
                    <Typography className={classes.zapStep}>
                      {/* TODO: Fill zap estimate */}
                      {t('Zap-Step-Deposit-1', {
                        valueFrom: formData.deposit.amount.toFixed(2),
                        tokenFrom: formData.deposit.token,
                        valueTo: '0.00',
                        tokenTo: 'TOKEN',
                      })}
                    </Typography>
                  </li>
                  <li>
                    <Typography className={classes.zapStep}>
                      {t('Zap-Step-Deposit-2', { lpToken: item.token })}
                    </Typography>
                  </li>
                  <li>
                    <Typography className={classes.zapStep}>
                      {t('Zap-Step-Deposit-3', { lpToken: item.token })}
                    </Typography>
                  </li>
                  <li>
                    <Typography className={classes.zapStep}>
                      {t('Zap-Step-Deposit-4', { token0: item.assets[0], token1: item.assets[1] })}
                    </Typography>
                  </li>
                </ol>
              </>
            ) : (
              <>
                <ol className={classes.ol}>
                  <li>
                    <Typography className={classes.zapStep}>
                      {/* TODO: Fill zap estimate */}
                      {t('Zap-Step-Withdraw-1', {
                        mooToken: item.earnedToken,
                        lpToken: item.token,
                      })}
                    </Typography>
                  </li>
                  <li>
                    <Typography className={classes.zapStep}>
                      {t('Zap-Step-Withdraw-2', {
                        lpToken: item.token,
                        token0: item.assets[0],
                        token1: item.assets[1],
                      })}
                    </Typography>
                  </li>
                  <li>
                    {/* TODO: hook up dynamic values */}
                    <Typography className={classes.zapStep}>
                      {t('Zap-Step-Withdraw-3', {
                        valueFrom: formData.withdraw.amount.toFixed(2),
                        tokenFrom: formData.withdraw.token,
                        valueTo: '0.00',
                        tokenTo: 'TOKEN',
                      })}
                    </Typography>
                  </li>
                  <li>
                    {/* TODO: hook up dynamic values */}
                    <Typography className={classes.zapStep}>
                      {t('Zap-Step-Withdraw-4', { balance: '0.00', token: 'TOKEN' })}
                    </Typography>
                  </li>
                </ol>
              </>
            )}

            <Divider className={classes.divider} />
          </Grid>
        ) : null}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between">
            <Typography className={classes.title}>{t('Fee-Title')}</Typography>
            {/*<Popover title={t('Fee-Tagline')} solid size="md">
              <div className={classes.feeBreakdownBlock}>
                <Typography className={classes.feeBreakdownBold}>
                  {t('Fee-DepositAmt', {
                    amt: formattedDepositFee,
                  })}
                </Typography>
                <Typography className={classes.feeBreakdownDetail}>
                  {t('Fee-DepositTrgt')}
                </Typography>
              </div>
              <div className={classes.feeBreakdownBlock}>
                <Typography className={classes.feeBreakdownBold}>
                  {t('Fee-WithdrawAmt', {
                    amt: formattedWithdrawalFee,
                  })}
                </Typography>
                <Typography className={classes.feeBreakdownDetail}>
                  {t('Fee-WithdrawTrgt', {
                    amt: formattedWithdrawalFee,
                  })}
                </Typography>
              </div>
              <div className={classes.feeBreakdownBlock}>
                <Typography className={classes.feeBreakdownBold}>
                  {t('Fee-Perform', { amt: '4.5%' })}
                </Typography>
                <Typography className={classes.feeBreakdownDetailPerf}>
                  {t('Fee-PerformHodler', { amt: '2.5%' })}
                </Typography>
                <Typography className={classes.feeBreakdownDetailPerf}>
                  {t('Fee-PerformTreas', { amt: '1.5%' })}
                </Typography>
                <Typography className={classes.feeBreakdownDetailPerf}>
                  {t('Fee-PerformStrat', { amt: '0.5%' })}
                </Typography>
              </div>
                </Popover>*/}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.label}>{t('Fee-Deposit')}</Typography>
          <Typography className={classes.value}>{formattedDepositFee}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.label}>{t('Fee-Withdraw')}</Typography>
          <Typography className={classes.value}>{formattedWithdrawalFee}</Typography>
        </Grid>
        <Grid item xs={6}>
          <div className={classes.flexAlignCenter}>
            <Typography className={classes.label} style={{ marginRight: '4px' }}>
              {/* TODO: add dynamic fee */}
              {t('Fee-Performance')}
            </Typography>
            <Popover>
              <PerformanceFees vaultID={item.id} />
            </Popover>
          </div>
          {/*TODO : add dynamic fee */}
          <Typography className={classes.value}>
            {item.id === 'cake-cakev2' ? '1%' : '4.5%'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Box pt={1}>
            <Typography className={classes.text}>{t('Fee-PerformExt')}</Typography>
          </Box>
          {/*<Divider className={classes.divider} />
          <Typography className={classes.title}>{t('Fee-Transaction')}</Typography>*/}
        </Grid>
        {/*<Grid item xs={6}>
          <Typography className={classes.value}>0.05 BNB ($0.10)</Typography>
          <Typography className={classes.label}>{t('Deposit-Noun')}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.value}>0.05 BNB ($0.10)</Typography>
          <Typography className={classes.label}>{t('Withdraw-Noun')}</Typography>
        </Grid>*/}
      </Grid>
    </Box>
  ); //return
}; //const FeeBreakdown

export default FeeBreakdown;
