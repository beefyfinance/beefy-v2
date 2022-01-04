import Backdrop from '@material-ui/core/Backdrop';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/styles/makeStyles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import ArrowRight from '@material-ui/icons/ArrowRight';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { byDecimals } from '../../helpers/format';
import { isEmpty } from '../../helpers/utils';
import { Loader } from '../loader';
import { styles } from './styles';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles(styles as any);
export const Steps = ({ item, steps, handleClose }) => {
  const history = useHistory();
  const classes = useStyles();
  const t = useTranslation().t;
  const wallet = useSelector((state: any) => state.walletReducer);

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
                {/* New Attempt  */}
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
                ) : null}
                {steps.items[steps.currentStep].step === 'withdraw' ? (
                  <React.Fragment>
                    <Typography variant={'h2'}>
                      <React.Fragment>
                        {item.isGovVault
                          ? byDecimals(
                              new BigNumber(wallet.action.data.amount),
                              steps.items[steps.currentStep].token.decimals
                            ).toFixed(8)
                          : null}
                        {!item.isGovVault
                          ? byDecimals(
                              new BigNumber(wallet.action.data.amount).multipliedBy(
                                byDecimals(item.pricePerFullShare)
                              ),
                              item.tokenDecimals
                            ).toFixed(8)
                          : null}{' '}
                        {item.token}
                      </React.Fragment>
                    </Typography>
                    <Typography variant={'h2'}>{t('Withdraw-Done')}</Typography>
                  </React.Fragment>
                ) : null}
                {/* exit-unstake should be used for boosts, since button mentions
                  those function names */}
                {steps.items[steps.currentStep].step === 'claim-unstake' ? (
                  <React.Fragment>
                    <Typography variant={'h2'}>{t('Claim-Unstake-Done')}</Typography>
                  </React.Fragment>
                ) : null}
                {/* exit-withdraw should be used for gov pools, since button mentions
                  those function names */}
                {steps.items[steps.currentStep].step === 'claim-withdraw' ? (
                  <React.Fragment>
                    <Typography variant={'h2'}>{t('Claim-Withdraw-Done')}</Typography>
                  </React.Fragment>
                ) : null}
                {steps.items[steps.currentStep].step === 'stake' ? (
                  <React.Fragment>
                    <Typography variant={'h2'}>{t('Stake-Done')}</Typography>
                  </React.Fragment>
                ) : null}
                {steps.items[steps.currentStep].step === 'unstake' ? (
                  <React.Fragment>
                    <Typography variant={'h2'}>{t('Unstake-Done')}</Typography>
                  </React.Fragment>
                ) : null}
                {steps.items[steps.currentStep].step === 'claim' ? (
                  <React.Fragment>
                    <Typography variant={'h2'}>{t('Claim-Done')}</Typography>
                  </React.Fragment>
                ) : null}

                {/* Old stuff */}
                {/* {steps.items[steps.currentStep].step === 'deposit' ? (
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
                          {item.isGovVault
                            ? byDecimals(
                                new BigNumber(wallet.action.data.amount),
                                steps.items[steps.currentStep].token.decimals
                              ).toFixed(8)
                            : null}
                          {!item.isGovVault
                            ? byDecimals(
                                new BigNumber(wallet.action.data.amount).multipliedBy(
                                  byDecimals(item.pricePerFullShare)
                                ),
                                item.tokenDecimals
                              ).toFixed(8)
                            : null}{' '}
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
                )} */}
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
                    } as any);
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
                  <Loader message={''} line={false} />
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
