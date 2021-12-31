import { Box, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { Popover } from '../../../../components/Popover';
import { Loader } from '../../../../components/loader';
const useStyles = makeStyles(styles as any);
const BreakdownTooltip = memo(({ rows }: any) => {
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

const PerformanceFees = memo(({ rates, vaultID, performanceFee }: any) => {
  const rows = [];
  const { t } = useTranslation();

  //TODO REMOVE WHEN CAN GET DYNAMIC DATA FROM ABOUT FEES
  const isCakeVault = vaultID === 'cake-cakev2';

  if (performanceFee === '0%') {
    rows.push({
      label: t('Fee-Holder'),
      value: '0%',
      last: false,
    });

    rows.push({
      label: t('Fee-Treasury'),
      value: '0%',
      last: false,
    });

    rows.push({
      label: t('Fee-Developers'),
      value: '0%',
      last: false,
    });

    rows.push({
      label: t('Fee-HarvestFee'),
      value: '0%',
      last: false,
    });

    rows.push({
      label: t('Fee-TotalFee'),
      value: '0%',
      last: true,
    });
  } else {
    rows.push({
      label: t('Fee-Holder'),
      value: isCakeVault ? '1%' : '3%',
      last: false,
    });

    rows.push({
      label: t('Fee-Treasury'),
      value: isCakeVault ? '0%' : '0.5%',
      last: false,
    });

    rows.push({
      label: t('Fee-Developers'),
      value: isCakeVault ? '0%' : '0.5%',
      last: false,
    });
    rows.push({
      label: t('Fee-HarvestFee'),
      value: isCakeVault ? '0%' : '0.5%',
      last: false,
    });

    rows.push({
      label: t('Fee-TotalFee'),
      value: isCakeVault ? '1%' : '4.5%',
      last: true,
    });
  }

  return <BreakdownTooltip rows={rows} />;
});

export const FeeBreakdown = ({ item, formData, type }) => {
  const classes = useStyles();
  const t = useTranslation().t;
  const formattedDepositFee = item.depositFee;
  const formattedWithdrawalFee = item.withdrawalFee;
  const performanceFee = item.isGovVault ? '0%' : item.id === 'cake-cakev2' ? '1%' : '4.5%';

  return (
    <Box mt={2} p={2} className={classes.feeContainer}>
      <Grid container>
        <Grid item xs={12}>
          {type === 'deposit' && formData.deposit.isZap && (
            <>
              <Typography className={classes.title} style={{ marginBottom: '12px' }}>
                {t('Zap-Title')}
              </Typography>
              {formData.deposit.zapEstimate.isLoading ? (
                <Loader message={'Loading swap estimate...'} line={true} />
              ) : (
                <ol className={classes.ol}>
                  <li>
                    <Typography className={classes.zapStep}>
                      {t('Zap-Step-Deposit-1', {
                        valueFrom: formData.deposit.zapEstimate.amountIn.significant(6),
                        tokenFrom: formData.deposit.zapEstimate.tokenIn.symbol,
                        valueTo: formData.deposit.zapEstimate.amountOut.significant(6),
                        tokenTo: formData.deposit.zapEstimate.tokenOut.symbol,
                        slippageTolerancePercentage: formData.slippageTolerance * 100,
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
                      {t('Zap-Step-Deposit-4', {
                        token0: item.assets[0],
                        token1: item.assets[1],
                      })}
                    </Typography>
                  </li>
                </ol>
              )}
            </>
          )}
          {type === 'withdraw' && formData.withdraw.isZap && (
            <>
              <Typography className={classes.title} style={{ marginBottom: '12px' }}>
                {t('Zap-Title')}
              </Typography>
              {formData.withdraw.zapEstimate.isLoading ? (
                <Loader message={'Loading swap estimate...'} line={true} />
              ) : (
                <ol className={classes.ol}>
                  <li>
                    <Typography className={classes.zapStep}>
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
                  {formData.withdraw.isZapSwap && (
                    <li>
                      <Typography className={classes.zapStep}>
                        {t('Zap-Step-Withdraw-3', {
                          valueFrom: formData.withdraw.zapEstimate.amountIn.significant(6),
                          tokenFrom: formData.withdraw.zapEstimate.tokenIn.symbol,
                          valueTo: formData.withdraw.zapEstimate.amountOut.significant(6),
                          tokenTo: formData.withdraw.zapEstimate.tokenOut.symbol,
                          slippageTolerancePercentage: formData.slippageTolerance * 100,
                        })}
                      </Typography>
                    </li>
                  )}
                  {formData.withdraw.isZapSwap && (
                    <li>
                      <Typography className={classes.zapStep}>
                        {t('Zap-Step-Withdraw-4', {
                          balance: formData.withdraw.zapEstimate.amountOut.times(2).significant(6),
                          token: formData.withdraw.zapEstimate.tokenOut.symbol,
                        })}
                      </Typography>
                    </li>
                  )}
                </ol>
              )}
            </>
          )}
          <Divider className={classes.divider} />
        </Grid>
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

            <Popover {...({} as any)}>
              <PerformanceFees performanceFee={performanceFee} vaultID={item.id} />
            </Popover>
          </div>
          {/*TODO : add dynamic fee */}
          <Typography className={classes.value}>{performanceFee}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Box pt={1}>
            <Typography className={classes.text}>{t('Fee-PerformExt')}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  ); //return
}; //const FeeBreakdown
