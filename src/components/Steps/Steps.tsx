import React from 'react';
import { Box, Button, makeStyles, Typography, Snackbar, IconButton } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { byDecimals } from '../../helpers/format';
import { isEmpty } from '../../helpers/utils';
import { styles } from './styles';
import BigNumber from 'bignumber.js';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import clsx from 'clsx';

const useStyles = makeStyles(styles as any);
export const Steps = ({ item, steps, handleClose }) => {
  const classes = useStyles();
  const t = useTranslation().t;
  const wallet = useSelector((state: any) => state.walletReducer);

  console.log(steps.currentStep);

  return (
    <Snackbar
      key={steps.currentStep}
      open={steps.modal}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      autoHideDuration={6000}
    >
      <Box className={classes.snackbarContainer}>
        {console.log(steps.finished && steps.items[steps.currentStep].step === 'deposit')}
        <Box className={classes.topBar}>
          <Box
            className={clsx({
              [classes.progresBar]: true,
              [classes.progresBar1]: steps.items.length > 1,
              [classes.errorBar]: wallet.action && wallet.action.result === 'error',
              [classes.confirmationBar]:
                wallet.action && wallet.action.result === 'success_pending',
              [classes.successBar]: steps.finished,
            })}
          />
        </Box>
        <Box className={classes.contentContainer}>
          <Box className={classes.titleContainer}>
            <Typography className={classes.title} variant={'body1'}>
              {/* Error  */}
              {wallet.action && wallet.action.result === 'error' && (
                <>
                  <img
                    className={classes.icon}
                    src={require('../../images/error.svg').default}
                    alt="error"
                  />
                  {t('Transactn-Error')}
                </>
              )}
              {/* Waiting  */}
              {!steps.finished &&
                wallet.action &&
                wallet.action.result === 'success_pending' &&
                t('Transactn-ConfirmPending')}
              {/* Transactions  */}
              {!steps.finished &&
                wallet.action.result !== 'error' &&
                wallet.action.result !== 'success_pending' &&
                `${steps.currentStep} / ${steps.items.length} ${t('Transactn-Confirmed')} `}

              {steps.finished && (
                <>
                  {steps.items[steps.currentStep].step === 'deposit' && t('Deposit-Done')}
                  {steps.items[steps.currentStep].step === 'withdraw' && t('Withdraw-Done')}
                  {steps.items[steps.currentStep].step === 'claim-unstake' &&
                    t('Claim-Unstake-Done')}
                  {steps.items[steps.currentStep].step === 'stake' && t('Stake-Done')}
                  {steps.items[steps.currentStep].step === 'unstake' && t('Unstake-Done')}
                  {steps.items[steps.currentStep].step === 'claim' && t('Claim-Done')}
                </>
              )}
            </Typography>
            <IconButton className={classes.closeIcon} onClick={handleClose}>
              <CloseRoundedIcon fontSize="small" htmlColor="#8A8EA8" />
            </IconButton>
          </Box>
          <Box>
            {/* Steps Count Content */}
            {!isEmpty(steps.items[steps.currentStep]) &&
              wallet.action.result !== 'error' &&
              wallet.action.result !== 'success_pending' &&
              !steps.finished && (
                <Typography className={classes.message} variant={'body2'}>
                  {steps.items[steps.currentStep].message}
                </Typography>
              )}
            {/* Waiting Content */}
            {!steps.finished && wallet.action && wallet.action.result === 'success_pending' && (
              <Typography variant={'body2'} className={classes.message}>
                {t('Transactn-Wait')}
              </Typography>
            )}
            {/* Error content */}
            {!steps.finished && wallet.action && wallet.action.result === 'error' && (
              <>
                <Box className={classes.errorContent}>
                  <Typography variant="body1" className={classes.message}>
                    <span>{t('Error')}</span> {wallet.action.data.error}
                  </Typography>
                </Box>
                <Button className={classes.closeBtn} onClick={handleClose}>
                  {t('Transactn-Close')}
                </Button>
              </>
            )}
          </Box>
          {/* Steps finished */}
          {steps.finished && (
            <>
              {/* Succes deposit */}
              {steps.items[steps.currentStep].step === 'deposit' && (
                <>
                  <Box className={classes.successContent}>
                    <Typography variant="body1" className={classes.message}>
                      {t('Transactn-Success', {
                        amount: item.isGovVault
                          ? byDecimals(
                              new BigNumber(wallet.action.data.amount),
                              steps.items[steps.currentStep].token.decimals
                            ).toFixed(4)
                          : byDecimals(
                              new BigNumber(wallet.action.data.amount).multipliedBy(
                                byDecimals(item.pricePerFullShare)
                              ),
                              item.tokenDecimals
                            ).toFixed(4),
                        token: item.token,
                      })}
                    </Typography>
                    <Button
                      className={classes.redirectBtnSuccess}
                      href={
                        wallet.explorer[item.network] +
                        '/tx/' +
                        wallet.action.data.receipt.transactionHash
                      }
                      target="_blank"
                    >
                      {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#59A662" />}
                    </Button>
                  </Box>
                  <Box pt={2}>
                    <Typography variant="body1" className={classes.message}>
                      <span>{t('Remember')}</span> {t('Remember-Msg')}
                    </Typography>
                  </Box>
                </>
              )}
              {/* Success Withdraw */}
              {steps.items[steps.currentStep].step === 'withdraw' && (
                <>
                  <Box className={classes.successContent}>
                    <Typography variant="body1" className={classes.message}>
                      {t('Transactn-Withdrawal', {
                        amount: item.isGovVault
                          ? byDecimals(
                              new BigNumber(wallet.action.data.amount),
                              steps.items[steps.currentStep].token.decimals
                            ).toFixed(4)
                          : byDecimals(
                              new BigNumber(wallet.action.data.amount).multipliedBy(
                                byDecimals(item.pricePerFullShare)
                              ),
                              item.tokenDecimals
                            ).toFixed(4),
                        token: item.token,
                      })}
                    </Typography>
                    <Button
                      className={classes.redirectBtnSuccess}
                      href={
                        wallet.explorer[item.network] +
                        '/tx/' +
                        wallet.action.data.receipt.transactionHash
                      }
                      target="_blank"
                    >
                      {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#59A662" />}
                    </Button>
                  </Box>
                  <Button className={classes.closeBtn} onClick={handleClose}>
                    {t('Transactn-Close')}
                  </Button>
                </>
              )}
              {/* Boost Success */}
              {console.log(steps.items[steps.currentStep].amount)}
              {steps.items[steps.currentStep].step === 'stake' && (
                <>
                  <Box className={classes.successContent}>
                    <Typography variant="body1" className={classes.message}>
                      {t('Transactn-Success-Bst', {
                        amount: byDecimals(steps.items[steps.currentStep].amount).toFixed(2),
                        token: item.token,
                      })}
                    </Typography>

                    <Button
                      className={classes.redirectBtnSuccess}
                      href={
                        wallet.explorer[item.network] +
                        '/tx/' +
                        wallet.action.data.receipt.transactionHash
                      }
                      target="_blank"
                    >
                      {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#59A662" />}
                    </Button>
                  </Box>
                  <Box pt={2}>
                    <Typography variant="body1" className={classes.message}>
                      <span>{t('Remember')}</span> {t('Remember-Msg-Bst')}
                    </Typography>
                  </Box>
                </>
              )}
              {(steps.items[steps.currentStep].step === 'unstake' ||
                steps.items[steps.currentStep].step === 'claim-unstake') && (
                <>
                  <Box className={classes.successContent}>
                    <Typography variant="body1" className={classes.message}>
                      {t('Transactn-Withdrawal-Boost', {
                        amount: byDecimals(steps.items[steps.currentStep].amount).toFixed(2),
                        token: item.token,
                      })}
                    </Typography>
                    <Button
                      className={classes.redirectBtnSuccess}
                      href={
                        wallet.explorer[item.network] +
                        '/tx/' +
                        wallet.action.data.receipt.transactionHash
                      }
                      target="_blank"
                    >
                      {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#59A662" />}
                    </Button>
                  </Box>
                </>
              )}
              <Button className={classes.closeBtn} onClick={handleClose}>
                {t('Transactn-Close')}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Snackbar>
  ); //return
}; //const Steps

/* */
