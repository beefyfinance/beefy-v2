import { Box, Button, makeStyles, Typography, Snackbar, IconButton } from '@material-ui/core';
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

const useStyles = makeStyles(styles as any);

export const Steps = ({
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
    >
      <Box className={classes.snackbarContainer}>
        <Box className={classes.topBar}>
          <Box
            className={clsx({
              [classes.progresBar]: true,
              [classes.progresBar25]:
                steps.items.length > 1 &&
                !steps.finished &&
                steps.items[steps.currentStep].step === 'approve',
              [classes.progresBar50]:
                steps.items.length > 1 &&
                !steps.finished &&
                (steps.items[steps.currentStep].step === 'withdraw' ||
                  steps.items[steps.currentStep].step === 'deposit'),
              [classes.progresBar75]:
                steps.items.length > 1 &&
                !steps.finished &&
                (steps.items[steps.currentStep].step === 'withdraw' ||
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
              walletActionsState.result !== 'error' &&
              walletActionsState.result !== 'success_pending' &&
              !steps.finished && (
                <Typography className={classes.message} variant={'body2'}>
                  {steps.items[steps.currentStep].message}
                </Typography>
              )}
            {/* Waiting Content */}
            {!steps.finished && walletActionsState.result === 'success_pending' && (
              <Typography variant={'body2'} className={classes.message}>
                {t('Transactn-Wait')}
              </Typography>
            )}
            {/* Error content */}
            {!steps.finished && walletActionsState.result === 'error' && (
              <>
                <Box className={classes.errorContent}>
                  <Typography variant="body1" className={classes.message}>
                    <span>{t('Error')}</span> {walletActionsState.data.error.message}
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
                        amount: formatBigDecimals(walletActionsState.data.amount, 2),
                        token: walletActionsState.data.token.symbol,
                      })}
                    </Typography>
                    <TransactionLink vaultId={vaultId} />
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
                        amount: formatBigDecimals(walletActionsState.data.amount, 2),
                        token: walletActionsState.data.token.symbol,
                      })}
                    </Typography>
                    <TransactionLink vaultId={vaultId} />
                  </Box>
                </>
              )}
              {/* Boost Success */}
              {steps.items[steps.currentStep].step === 'stake' && (
                <>
                  <Box className={classes.successContent}>
                    <Typography variant="body1" className={classes.message}>
                      {t('Transactn-Success-Bst', {
                        amount: formatBigDecimals(walletActionsState.data.amount, 2),
                        token: walletActionsState.data.token.symbol,
                      })}
                    </Typography>
                    <TransactionLink vaultId={vaultId} />
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
                        amount: formatBigDecimals(walletActionsState.data.amount, 2),
                        token: walletActionsState.data.token.symbol,
                      })}
                    </Typography>
                    <TransactionLink vaultId={vaultId} />
                  </Box>
                </>
              )}
              {steps.items[steps.currentStep].step === 'claim' && (
                <>
                  <Box className={classes.successContent}>
                    <Typography variant="body1" className={classes.message}>
                      {t('Transactn-Claimed', {
                        amount: formatBigDecimals(walletActionsState.data.amount, 2),
                        token: walletActionsState.data.token.symbol,
                      })}
                    </Typography>
                    <TransactionLink vaultId={vaultId} />
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
  );
};

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
    <Button
      className={classes.redirectBtnSuccess}
      href={chain.explorerUrl + '/tx/' + hash}
      target="_blank"
    >
      {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#59A662" />}
    </Button>
  );
}
