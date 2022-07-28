import { Box, Divider, Grid, makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { Loader } from '../../../../components/Loader';
import { BifiMaxis } from './BifiMaxis';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';
import { InterestTooltipContent } from '../../../home/components/Vault/components/InterestTooltipContent';
import { IconWithTooltip } from '../../../../components/Tooltip';
import clsx from 'clsx';
import { formatPercent } from '../../../../helpers/format';
import { AlertWarning } from '../../../../components/Alerts';
import { ZapDepositEstimate, ZapWithdrawEstimate } from '../../../data/apis/zap/zap-types';

const useStyles = makeStyles(styles);

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

  return <InterestTooltipContent rows={rows} />;
});

export const FeeBreakdown = memo(
  ({
    vault,
    slippageTolerance,
    zapEstimate,
    zapError,
    isZapSwap,
    isZap,
    type,
  }: {
    vault: VaultEntity;
    slippageTolerance: number;
    zapEstimate: ZapDepositEstimate | ZapWithdrawEstimate | null;
    zapError: string | null;
    isZapSwap: boolean;
    isZap: boolean;
    type: 'deposit' | 'withdraw';
  }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const formattedDepositFee = vault.depositFee;
    const formattedWithdrawalFee = vault.withdrawalFee;
    const depositToken = useAppSelector(state =>
      selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
    );
    const earnedToken = useAppSelector(state =>
      selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
    );
    const performanceFee =
      isGovVault(vault) || BifiMaxis.includes(vault.id)
        ? '0%'
        : vault.id === 'cake-cakev2'
        ? '1%'
        : '4.5%';

    return (
      <Box mt={3} p={2} className={classes.feeContainer}>
        <Grid container>
          <Grid item xs={12}>
            {type === 'deposit' && isZap && (
              <>
                <div className={clsx(classes.title, classes.zapTitle)}>{t('Zap-Title')}</div>
                {zapError !== null ? (
                  <AlertWarning>{zapError}</AlertWarning>
                ) : zapEstimate === null ? (
                  <Loader message={'Loading swap estimate...'} line={true} />
                ) : (
                  <ol className={classes.ol}>
                    <li className={classes.zapStep}>
                      {t('Zap-Step-Deposit-1', {
                        valueFrom: zapEstimate.amountIn.decimalPlaces(6),
                        tokenFrom: zapEstimate.tokenIn.symbol,
                        valueTo: zapEstimate.amountOut.decimalPlaces(6),
                        tokenTo: zapEstimate.tokenOut.symbol,
                        slippageTolerancePercentage: slippageTolerance * 100,
                        priceImpact: formatPercent(-zapEstimate.priceImpact, 2, '0%'),
                      })}
                    </li>
                    <li className={classes.zapStep}>
                      {t('Zap-Step-Deposit-2', { lpToken: depositToken.symbol })}
                    </li>
                    <li className={classes.zapStep}>
                      {t('Zap-Step-Deposit-3', { lpToken: depositToken.symbol })}
                    </li>
                    <li className={classes.zapStep}>
                      {t('Zap-Step-Deposit-4', {
                        token0: vault.assetIds[0],
                        token1: vault.assetIds[1],
                      })}
                    </li>
                  </ol>
                )}
              </>
            )}
            {type === 'withdraw' && isZap && (
              <>
                <div className={clsx(classes.title, classes.zapTitle)}>{t('Zap-Title')}</div>
                {zapError !== null ? (
                  <AlertWarning>{zapError}</AlertWarning>
                ) : zapEstimate === null ? (
                  <Loader message={'Loading swap estimate...'} line={true} />
                ) : (
                  <ol className={classes.ol}>
                    <li className={classes.zapStep}>
                      {t('Zap-Step-Withdraw-1', {
                        mooToken: earnedToken.symbol,
                        lpToken: depositToken.symbol,
                      })}
                    </li>
                    <li className={classes.zapStep}>
                      {t('Zap-Step-Withdraw-2', {
                        lpToken: depositToken.symbol,
                        token0: vault.assetIds[0],
                        token1: vault.assetIds[1],
                      })}
                    </li>
                    {isZapSwap && (
                      <li className={classes.zapStep}>
                        {t('Zap-Step-Withdraw-3', {
                          valueFrom: zapEstimate.amountIn.decimalPlaces(6),
                          tokenFrom: zapEstimate.tokenIn.symbol,
                          valueTo: zapEstimate.amountOut.decimalPlaces(6),
                          tokenTo: zapEstimate.tokenOut.symbol,
                          slippageTolerancePercentage: slippageTolerance * 100,
                          priceImpact: formatPercent(-zapEstimate.priceImpact, 2, '0%'),
                        })}
                      </li>
                    )}
                    {isZapSwap && (
                      <li className={classes.zapStep}>
                        {t('Zap-Step-Withdraw-4', {
                          balance: (zapEstimate as ZapWithdrawEstimate).totalOut.decimalPlaces(6),
                          token: zapEstimate.tokenOut.symbol,
                        })}
                      </li>
                    )}
                  </ol>
                )}
              </>
            )}
            {isZap && <Divider className={classes.divider} />}
          </Grid>
          <Grid item xs={12}>
            <div className={classes.title}>{t('Fee-Title')}</div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.label}>{t('Fee-Deposit')}</div>
            <div className={classes.value}>{formattedDepositFee}</div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.label}>{t('Fee-Withdraw')}</div>
            <div className={classes.value}>{formattedWithdrawalFee}</div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.label} style={{ marginRight: '4px' }}>
              {/* TODO: add dynamic fee */}
              {t('Fee-Performance')}
              <IconWithTooltip
                triggerClass={classes.tooltipTrigger}
                content={<PerformanceFees performanceFee={performanceFee} vaultID={vault.id} />}
              />
            </div>
            {/*TODO : add dynamic fee */}
            <div className={classes.value}>{performanceFee}</div>
          </Grid>
          <Grid item xs={12}>
            <Box pt={1} className={classes.smallText}>
              {t('Fee-PerformExt')}
            </Box>
          </Grid>
        </Grid>
      </Box>
    ); //return
  }
); //const FeeBreakdown
