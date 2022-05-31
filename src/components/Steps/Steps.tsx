import React from 'react';
import { Box, Button, IconButton, makeStyles, Snackbar, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { isEmpty } from '../../helpers/utils';
import { styles } from './styles';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import clsx from 'clsx';
import { BeefyState } from '../../redux-types';
import { StepperState } from './types';
import { formatBigDecimals } from '../../helpers/format';
import { selectMintResult } from './selectors';
import { ChainEntity } from '../../features/data/entities/chain';
import { BridgeInfo } from './components/BridgeInfo';
import { TransactionLink } from './components/TransactionLink';

const useStyles = makeStyles(styles as any);

const _Steps = ({
  chainId,
  steps,
  handleClose,
}: {
  chainId: ChainEntity['id'];
  steps: StepperState;
  handleClose: () => unknown;
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const walletActionsState = useSelector((state: BeefyState) => state.user.walletActions);
  const bridgeModalState = useSelector((state: BeefyState) => state.ui.bridgeModal);

  const needShowPendingInBridge =
    bridgeModalState.status === 'loading' || bridgeModalState.status === 'confirming';

  return (
    <Snackbar
      key={steps.currentStep}
      open={steps.modal}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      autoHideDuration={6000}
      className={classes.snackbar}
    >
      <Box className={classes.snackbarContainer}>
        <Box className={classes.topBar}>
          <Box
            className={clsx({
              [classes.progressBar]: true,
              [classes.progressBar25]:
                steps.items.length > 1 &&
                !steps.finished &&
                steps.items[steps.currentStep].step === 'approve',
              [classes.progressBar50]:
                bridgeModalState.status === 'loading' ||
                (steps.items.length > 1 &&
                  !steps.finished &&
                  (steps.items[steps.currentStep].step === 'withdraw' ||
                    steps.items[steps.currentStep].step === 'claim-withdraw' ||
                    steps.items[steps.currentStep].step === 'deposit')),
              [classes.progressBar75]:
                bridgeModalState.status === 'confirming' ||
                (steps.items.length > 1 &&
                  !steps.finished &&
                  (steps.items[steps.currentStep].step === 'withdraw' ||
                    steps.items[steps.currentStep].step === 'claim-withdraw' ||
                    steps.items[steps.currentStep].step === 'deposit') &&
                  walletActionsState.result === 'success_pending' &&
                  steps.items[steps.currentStep].step !== 'bridge'),
              [classes.errorBar]: walletActionsState.result === 'error',
              [classes.confirmationBar]: walletActionsState.result === 'success_pending',
              [classes.successBar]:
                bridgeModalState.status === 'success' ||
                (steps.finished && steps.items[steps.currentStep].step !== 'bridge'),
            })}
          />
        </Box>
        <Box className={classes.contentContainer}>
          <Box className={classes.titleContainer}>
            <Typography className={classes.title} variant={'body1'}>
              {/* Error  */}
              {walletActionsState.result === 'error' && (
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
              {(needShowPendingInBridge ||
                (!steps.finished && walletActionsState.result === 'success_pending')) &&
                t('Transactn-ConfirmPending')}
              {/* Transactions  */}
              {!steps.finished &&
                walletActionsState.result !== 'error' &&
                walletActionsState.result !== 'success_pending' &&
                `${steps.currentStep} / ${steps.items.length} ${t('Transactn-Confirmed')} `}

              {steps.finished && (
                <>
                  {steps.items[steps.currentStep].step === 'deposit' && t('Deposit-Done')}
                  {steps.items[steps.currentStep].step === 'withdraw' && t('Withdraw-Done')}
                  {steps.items[steps.currentStep].step === 'claim-withdraw' && t('Withdraw-Done')}
                  {steps.items[steps.currentStep].step === 'claim-unstake' &&
                    t('Claim-Unstake-Done')}
                  {steps.items[steps.currentStep].step === 'stake' && t('Stake-Done')}
                  {steps.items[steps.currentStep].step === 'unstake' && t('Unstake-Done')}
                  {steps.items[steps.currentStep].step === 'claim' && t('Claim-Done')}
                  {steps.items[steps.currentStep].step === 'mint' && t('Mint-Done')}
                  {steps.items[steps.currentStep].step === 'burn' && t('Burn-Done')}
                  {steps.items[steps.currentStep].step === 'bridge' &&
                    bridgeModalState.status === 'success' &&
                    t('Bridge-Done')}
                </>
              )}
            </Typography>
            <IconButton className={classes.closeIcon} onClick={handleClose}>
              <CloseRoundedIcon fontSize="small" htmlColor="#8A8EA8" />
            </IconButton>
          </Box>
          {/* Steps Count Content */}
          {!isEmpty(steps.items[steps.currentStep]) &&
            walletActionsState.result !== 'error' &&
            walletActionsState.result !== 'success_pending' &&
            !steps.finished && (
              <Typography className={classes.message} variant={'body2'}>
                {steps.items[steps.currentStep].message}
              </Typography>
            )}
          {/* Waiting Content */}
          {(needShowPendingInBridge ||
            (!steps.finished && walletActionsState.result === 'success_pending')) && (
            <Typography variant={'body2'} className={classes.message}>
              {t('Transactn-Wait')}
            </Typography>
          )}
          {/* Error content */}
          {!steps.finished && walletActionsState.result === 'error' && (
            <>
              <Box className={clsx(classes.content, classes.errorContent)}>
                {walletActionsState.data.error.friendlyMessage ? (
                  <Typography variant="body1" className={classes.friendlyMessage}>
                    {walletActionsState.data.error.friendlyMessage}
                  </Typography>
                ) : null}
                <Typography variant="body1" className={classes.message}>
                  {walletActionsState.data.error.message}
                </Typography>
              </Box>
              <Button className={classes.closeBtn} onClick={handleClose}>
                {t('Transactn-Close')}
              </Button>
            </>
          )}
          {!isEmpty(steps.items[steps.currentStep]) &&
            steps.items[steps.currentStep].step === 'bridge' &&
            (walletActionsState.result === 'success_pending' ||
              walletActionsState.result === 'success') && <BridgeInfo steps={steps} />}

          {/* Steps finished */}
          {steps.finished && (
            <>
              {/* Succes deposit */}
              {steps.items[steps.currentStep].step === 'deposit' &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <Typography variant="body1" className={classes.message}>
                        {t('Transactn-Success', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </Typography>
                      <TransactionLink chainId={chainId} />
                    </Box>
                    <Box pt={2}>
                      <Typography variant="body1" className={classes.message}>
                        <span>{t('Remember')}</span> {t('Remember-Msg')}
                      </Typography>
                    </Box>
                  </>
                )}
              {/* Success Withdraw */}
              {(steps.items[steps.currentStep].step === 'withdraw' ||
                steps.items[steps.currentStep].step === 'claim-withdraw') &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <Typography variant="body1" className={classes.message}>
                        {t('Transactn-Withdrawal', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </Typography>
                      <TransactionLink chainId={chainId} />
                    </Box>
                  </>
                )}
              {/* Boost Success */}
              {steps.items[steps.currentStep].step === 'stake' &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <Typography variant="body1" className={classes.message}>
                        {t('Transactn-Success-Bst', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </Typography>
                      <TransactionLink chainId={chainId} />
                    </Box>
                    <Box pt={2}>
                      <Typography variant="body1" className={classes.message}>
                        <span>{t('Remember')}</span> {t('Remember-Msg-Bst')}
                      </Typography>
                    </Box>
                  </>
                )}
              {(steps.items[steps.currentStep].step === 'unstake' ||
                steps.items[steps.currentStep].step === 'claim-unstake') &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <Typography variant="body1" className={classes.message}>
                        {t('Transactn-Withdrawal-Boost', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </Typography>
                      <TransactionLink chainId={chainId} />
                    </Box>
                  </>
                )}
              {steps.items[steps.currentStep].step === 'claim' &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <Typography variant="body1" className={classes.message}>
                        {t('Transactn-Claimed', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </Typography>
                      <TransactionLink chainId={chainId} />
                    </Box>
                  </>
                )}
              {steps.items[steps.currentStep].step === 'mint' &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <Typography variant="body1" className={classes.message}>
                        {t(
                          selectMintResult(walletActionsState).type === 'buy'
                            ? 'Transactn-Bought'
                            : 'Transactn-Minted',
                          {
                            amount: selectMintResult(walletActionsState).amount,
                            token: walletActionsState.data.token.symbol,
                          }
                        )}
                      </Typography>
                      <TransactionLink chainId={chainId} />
                    </Box>
                  </>
                )}
              {steps.items[steps.currentStep].step === 'burn' &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <Typography variant="body1" className={classes.message}>
                        {t('Transactn-Burned', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </Typography>
                      <TransactionLink chainId={chainId} />
                    </Box>
                  </>
                )}
              {steps.items[steps.currentStep].step === 'bridge' ? (
                bridgeModalState.status === 'success' ? (
                  <Button className={classes.closeBtn} onClick={handleClose}>
                    {t('Transactn-Close')}
                  </Button>
                ) : null
              ) : (
                <Button className={classes.closeBtn} onClick={handleClose}>
                  {t('Transactn-Close')}
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
    </Snackbar>
  );
};

export const Steps = React.memo(_Steps);
