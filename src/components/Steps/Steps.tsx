import React from 'react';
import { Box, IconButton, makeStyles, Snackbar } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { isEmpty } from '../../helpers/utils';
import { styles } from './styles';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import clsx from 'clsx';
import { BeefyState } from '../../redux-types';
import { selectChainById } from '../../features/data/selectors/chains';
import { VaultEntity } from '../../features/data/entities/vault';
import { StepperState } from './types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { formatBigDecimals } from '../../helpers/format';
import { selectMintResult } from './selectors';
import { Button } from '../Button';

const useStyles = makeStyles(styles);

const _Steps = ({
  vaultId,
  steps,
  handleClose,
}: {
  vaultId: VaultEntity['id'];
  steps: StepperState;
  handleClose: () => unknown;
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const walletActionsState = useSelector((state: BeefyState) => state.user.walletActions);

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
                steps.items.length > 1 &&
                !steps.finished &&
                (steps.items[steps.currentStep].step === 'withdraw' ||
                  steps.items[steps.currentStep].step === 'claim-withdraw' ||
                  steps.items[steps.currentStep].step === 'deposit'),
              [classes.progressBar75]:
                steps.items.length > 1 &&
                !steps.finished &&
                (steps.items[steps.currentStep].step === 'withdraw' ||
                  steps.items[steps.currentStep].step === 'claim-withdraw' ||
                  steps.items[steps.currentStep].step === 'deposit') &&
                walletActionsState.result === 'success_pending',
              [classes.errorBar]: walletActionsState.result === 'error',
              [classes.confirmationBar]: walletActionsState.result === 'success_pending',
              [classes.successBar]: steps.finished,
            })}
          />
        </Box>
        <Box className={classes.contentContainer}>
          <Box className={classes.titleContainer}>
            <div className={classes.title}>
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
              {!steps.finished &&
                walletActionsState.result === 'success_pending' &&
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
                </>
              )}
            </div>
            <IconButton className={classes.closeIcon} onClick={handleClose}>
              <CloseRoundedIcon fontSize="small" htmlColor="#8A8EA8" />
            </IconButton>
          </Box>
          {/* Steps Count Content */}
          {!isEmpty(steps.items[steps.currentStep]) &&
            walletActionsState.result !== 'error' &&
            walletActionsState.result !== 'success_pending' &&
            !steps.finished && (
              <div className={classes.message}>{steps.items[steps.currentStep].message}</div>
            )}
          {/* Waiting Content */}
          {!steps.finished && walletActionsState.result === 'success_pending' && (
            <div className={classes.message}>{t('Transactn-Wait')}</div>
          )}
          {/* Error content */}
          {!steps.finished && walletActionsState.result === 'error' && (
            <>
              <Box className={clsx(classes.content, classes.errorContent)}>
                {walletActionsState.data.error.friendlyMessage ? (
                  <div className={classes.friendlyMessage}>
                    {walletActionsState.data.error.friendlyMessage}
                  </div>
                ) : null}
                <div className={classes.message}>{walletActionsState.data.error.message}</div>
              </Box>
              <Button
                borderless={true}
                fullWidth={true}
                className={classes.closeBtn}
                onClick={handleClose}
              >
                {t('Transactn-Close')}
              </Button>
            </>
          )}
          {/* Steps finished */}
          {steps.finished && (
            <>
              {/* Succes deposit */}
              {steps.items[steps.currentStep].step === 'deposit' &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <div className={classes.message}>
                        {t('Transactn-Success', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </div>
                      <TransactionLink vaultId={vaultId} />
                    </Box>
                    <Box mt={2}>
                      <div className={classes.message}>
                        <span>{t('Remember')}</span> {t('Remember-Msg')}
                      </div>
                    </Box>
                  </>
                )}
              {/* Success Withdraw */}
              {(steps.items[steps.currentStep].step === 'withdraw' ||
                steps.items[steps.currentStep].step === 'claim-withdraw') &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <div className={classes.message}>
                        {t('Transactn-Withdrawal', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </div>
                      <TransactionLink vaultId={vaultId} />
                    </Box>
                  </>
                )}
              {/* Boost Success */}
              {steps.items[steps.currentStep].step === 'stake' &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <div className={classes.message}>
                        {t('Transactn-Success-Bst', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </div>
                      <TransactionLink vaultId={vaultId} />
                    </Box>
                    <Box pt={2}>
                      <div className={classes.message}>
                        <span>{t('Remember')}</span> {t('Remember-Msg-Bst')}
                      </div>
                    </Box>
                  </>
                )}
              {(steps.items[steps.currentStep].step === 'unstake' ||
                steps.items[steps.currentStep].step === 'claim-unstake') &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <div className={classes.message}>
                        {t('Transactn-Withdrawal-Boost', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </div>
                      <TransactionLink vaultId={vaultId} />
                    </Box>
                  </>
                )}
              {steps.items[steps.currentStep].step === 'claim' &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <div className={classes.message}>
                        {t('Transactn-Claimed', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </div>
                      <TransactionLink vaultId={vaultId} />
                    </Box>
                  </>
                )}
              {steps.items[steps.currentStep].step === 'mint' &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <div className={classes.message}>
                        {t(
                          selectMintResult(walletActionsState).type === 'buy'
                            ? 'Transactn-Bought'
                            : 'Transactn-Minted',
                          {
                            amount: selectMintResult(walletActionsState).amount,
                            token: walletActionsState.data.token.symbol,
                          }
                        )}
                      </div>
                      <TransactionLink vaultId={vaultId} />
                    </Box>
                  </>
                )}
              {steps.items[steps.currentStep].step === 'burn' &&
                walletActionsState.result === 'success' && (
                  <>
                    <Box className={clsx(classes.content, classes.successContent)}>
                      <div className={classes.message}>
                        {t('Transactn-Burned', {
                          amount: formatBigDecimals(walletActionsState.data.amount, 2),
                          token: walletActionsState.data.token.symbol,
                        })}
                      </div>
                      <TransactionLink vaultId={vaultId} />
                    </Box>
                  </>
                )}
              <Button
                borderless={true}
                fullWidth={true}
                className={classes.closeBtn}
                onClick={handleClose}
              >
                {t('Transactn-Close')}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Snackbar>
  );
};

export const Steps = React.memo(_Steps);

function TransactionLink({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const walletActionsState = useSelector((state: BeefyState) => state.user.walletActions);
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));

  const hash =
    walletActionsState.result === 'success'
      ? walletActionsState.data.receipt.transactionHash
      : walletActionsState.result === 'success_pending'
      ? walletActionsState.data.hash
      : '';

  return (
    <a
      className={classes.redirectLinkSuccess}
      href={chain.explorerUrl + '/tx/' + hash}
      target="_blank"
      rel="noreferrer"
    >
      {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#59A662" fontSize="inherit" />}
    </a>
  );
}
