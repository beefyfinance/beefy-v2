import { Box, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { Popover } from '../../../../components/Popover';
import { Loader } from '../../../../components/loader';
import { BifiMaxis } from './BifiMaxis';

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

export const FeeBreakdown = memo(
  ({
    item,
    slippageTolerance,
    zapEstimate,
    isZapSwap,
    isZap,
    type,
  }: {
    item: any;
    slippageTolerance: number;
    zapEstimate: any;
    isZapSwap: boolean;
    isZap: boolean;
    type: 'deposit' | 'withdraw';
  }) => {
    const classes = useStyles();
    const t = useTranslation().t;
    const formattedDepositFee = item.depositFee;
    const formattedWithdrawalFee = item.withdrawalFee;
    const performanceFee =
      item.isGovVault || BifiMaxis.includes(item.id)
        ? '0%'
        : item.id === 'cake-cakev2'
        ? '1%'
        : '4.5%';

    return (
      <Box mt={2} p={2} className={classes.feeContainer}>
        <Grid container>
          <Grid item xs={12}>
            {type === 'deposit' && isZap && (
              <>
                <Typography className={classes.title} style={{ marginBottom: '12px' }}>
                  {t('Zap-Title')}
                </Typography>
                {zapEstimate.isLoading ? (
                  <Loader message={'Loading swap estimate...'} line={true} />
                ) : (
                  <ol className={classes.ol}>
                    <li>
                      <Typography className={classes.zapStep}>
                        {t('Zap-Step-Deposit-1', {
                          valueFrom: zapEstimate.amountIn.significant(6),
                          tokenFrom: zapEstimate.tokenIn.symbol,
                          valueTo: zapEstimate.amountOut.significant(6),
                          tokenTo: zapEstimate.tokenOut.symbol,
                          slippageTolerancePercentage: slippageTolerance * 100,
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
            {type === 'withdraw' && isZap && (
              <>
                <Typography className={classes.title} style={{ marginBottom: '12px' }}>
                  {t('Zap-Title')}
                </Typography>
                {zapEstimate.isLoading ? (
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
                    {isZapSwap && (
                      <li>
                        <Typography className={classes.zapStep}>
                          {t('Zap-Step-Withdraw-3', {
                            valueFrom: zapEstimate.amountIn.significant(6),
                            tokenFrom: zapEstimate.tokenIn.symbol,
                            valueTo: zapEstimate.amountOut.significant(6),
                            tokenTo: zapEstimate.tokenOut.symbol,
                            slippageTolerancePercentage: slippageTolerance * 100,
                          })}
                        </Typography>
                      </li>
                    )}
                    {isZapSwap && (
                      <li>
                        <Typography className={classes.zapStep}>
                          {t('Zap-Step-Withdraw-4', {
                            balance: zapEstimate.amountOut.times(2).significant(6),
                            token: zapEstimate.tokenOut.symbol,
                          })}
                        </Typography>
                      </li>
                    )}
                  </ol>
                )}
              </>
            )}
            {isZap && <Divider className={classes.divider} />}
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography className={classes.title}>{t('Fee-Title')}</Typography>
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
              <Typography variant="body2" className={classes.text}>
                {t('Fee-PerformExt')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    ); //return
  }
); //const FeeBreakdown
