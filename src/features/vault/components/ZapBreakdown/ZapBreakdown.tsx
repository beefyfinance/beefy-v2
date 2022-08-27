import { Box, Grid, makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { Loader } from '../../../../components/Loader';
import { VaultEntity } from '../../../data/entities/vault';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';
import clsx from 'clsx';
import { formatPercent } from '../../../../helpers/format';
import { AlertWarning } from '../../../../components/Alerts';
import { ZapDepositEstimate, ZapWithdrawEstimate } from '../../../data/apis/zap/zap-types';

const useStyles = makeStyles(styles);

export const ZapBreakdown = memo(
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
    const depositToken = useAppSelector(state =>
      selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
    );
    const earnedToken = useAppSelector(state =>
      selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
    );

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
          </Grid>
        </Grid>
      </Box>
    ); //return
  }
); //const ZapBreakdown
