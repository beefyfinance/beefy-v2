import { Backdrop, Box, Button, Fade, makeStyles, Modal, Typography } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { ArrowRight } from '@material-ui/icons';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { byDecimals } from 'helpers/format';
import { isEmpty } from 'helpers/utils';
import Loader from 'components/loader';
import styles from './styles';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles(styles);

const Steps = ({ item, steps, handleClose }) => {
  const history = useHistory();
  const classes = useStyles();
  const t = useTranslation().t;
  const wallet = useSelector(state => state.walletReducer);

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={steps.modal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={steps.modal}>
        {steps.finished ? (
          <React.Fragment>
            <Box>
              <Box p={8} className={classes.finishedCard}>
                {steps.items[steps.currentStep].step === 'deposit' ? (
                  <React.Fragment>
                    <Typography variant={'h2'}>
                      {byDecimals(
                        new BigNumber(wallet.action.data.amount),
                        steps.items[steps.currentStep].token.decimals
                      ).toFixed(8)}{' '}
                      {steps.items[steps.currentStep].token.symbol}
                    </Typography>
                    <Typography variant={'h2'}>{t('Deposit-Done')}</Typography>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Typography variant={'h2'}>
                      {steps.items[steps.currentStep].step === 'withdraw' ? (
                        <React.Fragment>
                          {byDecimals(
                            new BigNumber(wallet.action.data.amount).multipliedBy(
                              byDecimals(item.pricePerFullShare)
                            ),
                            item.tokenDecimals
                          ).toFixed(8)}{' '}
                          {item.token}
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          {byDecimals(
                            new BigNumber(wallet.action.data.amount),
                            item.earnedTokenDecimals
                          ).toFixed(8)}{' '}
                          {item.earnedToken}
                        </React.Fragment>
                      )}
                    </Typography>
                    <Typography variant={'h2'}>{t('Withdraw-Done')}</Typography>
                  </React.Fragment>
                )}
                <Typography>{t('Transactn-EnRoute')}</Typography>
                <Box mt={1} textAlign={'center'}>
                  <Button
                    className={classes.finishedBtn}
                    href={
                      wallet.explorer[item.network] +
                      '/tx/' +
                      wallet.action.data.receipt.transactionHash
                    }
                    target="_blank"
                  >
                    {t('Transactn-View')}
                  </Button>{' '}
                  <Button className={classes.finishedBtn} onClick={handleClose}>
                    {t('Transactn-CloseDialog')}
                  </Button>
                </Box>
              </Box>
              <Box mt={2} textAlign={'center'}>
                <Button
                  onClick={() => {
                    history.push({
                      pathname: '/',
                      portfolioOpen: true,
                    });
                  }}
                  className={classes.finishedBtn}
                >
                  {t('Transactn-GoPortfolio')} <ArrowRight />
                </Button>
              </Box>
            </Box>
          </React.Fragment>
        ) : (
          <Box className={classes.paper}>
            <Typography id="transition-modal-title" variant={'h2'}>
              {steps.currentStep} / {steps.items.length}
              <br />
              {t('Transactn-Confirmed')}
            </Typography>
            <Typography id="transition-modal-description" variant={'body2'}>
              {!isEmpty(steps.items[steps.currentStep])
                ? steps.items[steps.currentStep].message
                : ''}
            </Typography>
            {wallet.action && wallet.action.result === 'error' ? (
              <Alert severity={'error'}>
                <AlertTitle>{t('Transactn-Error')}</AlertTitle>
                <Typography>{wallet.action.data.error}</Typography>
                <Box textAlign={'center'} mt={2}>
                  <Button variant={'outlined'} onClick={handleClose}>
                    {t('Transactn-Close')}
                  </Button>
                </Box>
              </Alert>
            ) : (
              ''
            )}
            {wallet.action && wallet.action.result === 'success_pending' ? (
              <Alert severity={'info'}>
                <AlertTitle>{t('Transactn-ConfirmPending')}</AlertTitle>
                <Typography>{t('Transactn-Wait')}</Typography>
                <Box textAlign={'center'}>
                  <Loader />
                </Box>
                <Box textAlign={'center'} mt={2}>
                  <Button
                    variant={'outlined'}
                    href={wallet.explorer[item.network] + '/tx/' + wallet.action.data.hash}
                    target="_blank"
                  >
                    {t('Transactn-View')}
                  </Button>
                </Box>
              </Alert>
            ) : (
              ''
            )}
          </Box>
        )}
      </Fade>
    </Modal>
  ); //return
}; //const Steps

export default Steps;
