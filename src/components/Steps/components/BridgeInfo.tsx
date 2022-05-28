import { Box, makeStyles, Typography, CircularProgress, Button } from '@material-ui/core';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectChainById } from '../../../features/data/selectors/chains';
import { selectCurrentChainId } from '../../../features/data/selectors/wallet';
import { formatBigNumberSignificant } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';
import { styles } from '../styles';
import { StepperState } from '../types';
import { TransactionLink } from './TransactionLink';
import { getBridgeTxData } from '../../../features/data/actions/bridge';
import { bridgeModalActions } from '../../../features/data/reducers/wallet/bridge-modal';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { AlertWarning } from '../../Alerts';

const useStyles = makeStyles(styles as any);

interface TxStateInterface {
  msg: string;
  error: string | null;
  swapTx: string | null;
  multichainTxHash: string | null;
  status: 0 | 3 | 10 | 8 | 9 | 12 | 14;
}

const _BridgeInfo = ({ steps }: { steps: StepperState }) => {
  const [txData, setTxData] = React.useState<TxStateInterface>({
    msg: '',
    error: null,
    swapTx: null,
    multichainTxHash: null,
    status: 0,
  });
  const classes = useStyles();
  const { t } = useTranslation();
  const walletActionsState = useSelector((state: BeefyState) => state.user.walletActions);
  const currentChaindId = useSelector((state: BeefyState) => selectCurrentChainId(state));
  const bridgeModalState = useSelector((state: BeefyState) => state.ui.bridgeModal);
  const chain = useSelector((state: BeefyState) => selectChainById(state, currentChaindId));
  const destChain = useSelector((state: BeefyState) =>
    selectChainById(state, bridgeModalState.destChainId)
  );

  const dispatch = useDispatch();

  // Use a ref to keep track of a stateful value that doesn't affect rendering,
  // the `setInterval` ID in this case.
  const intervalRef: any = useRef();

  const hash =
    walletActionsState.result === 'success'
      ? walletActionsState.data.receipt.transactionHash
      : walletActionsState.result === 'success_pending'
      ? walletActionsState.data.hash
      : '';

  //TX DATA IS REFRESH EVERY 5 SECONDS
  React.useEffect(() => {
    const getTxData = () => {
      getBridgeTxData(hash)
        .then(res => {
          if (res.msg === 'Error') {
            setTxData({
              msg: 'Error',
              error: res.error,
              swapTx: null,
              multichainTxHash: null,
              status: 0,
            });
            dispatch(bridgeModalActions.setStatus({ status: 'loading' }));
          }
          if (res.msg === 'Success') {
            setTxData({
              msg: 'Success',
              swapTx: res.info.swaptx,
              multichainTxHash: res.info.txid,
              error: null,
              status: res.info.status,
            });
            //STATUS = 10 IS SUCCESS
            //FOR MORE INFO WATCH https://github.com/anyswap/CrossChain-Router/wiki/How-to-integrate-AnySwap-Router POINTN 4
            if (res.info.status === 10) {
              dispatch(bridgeModalActions.setStatus({ status: 'success' }));
              clearInterval(intervalRef.current);
            }
            //STATUS 14  = FAILURE
            if (res.info.status === 14) {
              dispatch(bridgeModalActions.setStatus({ status: 'idle' }));
              clearInterval(intervalRef.current);
            }
          }
        })
        .catch(err => {
          setTxData({
            swapTx: null,
            multichainTxHash: null,
            error: `Request Error ${err}`,
            msg: 'Error',
            status: 14,
          });
        });
    };

    intervalRef.current = setInterval(getTxData, 5000);

    // Clear the interval when this hook/component unmounts so it doesn't keep
    // running when this component is gone.
    return () => {
      clearInterval(intervalRef.current);
      dispatch(bridgeModalActions.setStatus({ status: 'idle' }));
    };
  }, [dispatch, hash]);

  return (
    <>
      {txData?.status === 10 && (
        <Box className={classes.succesContainer}>
          <Typography variant="body1" className={classes.textSuccess}>
            {t('Transactn-Bridge', {
              amount: formatBigNumberSignificant(bridgeModalState.amount, 4),
              chain: destChain.name,
            })}
          </Typography>
        </Box>
      )}
      {txData?.status === 14 && (
        <AlertWarning className={classes.errorMessage}>{t('Multichain-Error')}</AlertWarning>
      )}
      <Box className={classes.chainContainer}>
        <Box mb={1} className={classes.statusContainer}>
          <Box className={classes.chainStatusContainer}>
            <img
              className={classes.icon}
              alt={chain.id}
              src={require(`../../../images/networks/${chain.id}.svg`).default}
            />
            <Typography className={classes.chainName} variant="body1">
              {chain.name}
            </Typography>
          </Box>
          <Box className={classes.chainStatusContainer}>
            {walletActionsState.result === 'success_pending' && <CircularProgress size={16} />}
            {walletActionsState.result === 'success' && (
              <img
                style={{ height: '16px' }}
                alt="check"
                src={require(`../../../images/check.svg`).default}
              />
            )}
            <Typography className={classes.statusText} variant="body1">
              {walletActionsState.result === 'success_pending' && t('Pending')}
              {walletActionsState.result === 'success' && t('Success')}
            </Typography>
          </Box>
        </Box>
        <TransactionLink chainId={currentChaindId} />
      </Box>
      <Box className={classes.chainContainer}>
        <Box className={classes.statusContainer}>
          <Box className={classes.chainStatusContainer}>
            <img
              className={classes.icon}
              alt={chain.id}
              src={require(`../../../images/networks/${destChain.id}.svg`).default}
            />
            <Typography className={classes.chainName} variant="body1">
              {destChain.name}
            </Typography>
          </Box>
          {steps.finished && walletActionsState.result === 'success' && (
            <Box className={classes.chainStatusContainer}>
              {txData?.status !== 10 && <CircularProgress size={20} />}
              {txData?.status === 10 && (
                <img
                  style={{ height: '16px' }}
                  alt="check"
                  src={require(`../../../images/check.svg`).default}
                />
              )}
              <Typography className={classes.statusText} variant="body1">
                {txData?.status !== 10 && t('Pending')}
                {txData?.status === 10 && t('Success')}
              </Typography>
            </Box>
          )}
        </Box>
        {txData.msg !== 'Error' && txData.swapTx && (
          <Button
            style={{ marginTop: '8px' }}
            className={classes.redirectBtnSuccess}
            href={destChain.explorerUrl + '/tx/' + txData.swapTx}
            target="_blank"
          >
            {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#59A662" />}
          </Button>
        )}
      </Box>
      {txData.msg !== 'Error' && txData.multichainTxHash && (
        <Button
          style={{ marginTop: '16px', justifyContent: 'flex-start' }}
          className={classes.redirectBtnSuccess}
          href={`https://anyswap.net/explorer/tx?params=${txData.multichainTxHash}`}
          target="_blank"
        >
          {t('Transactn-ViewMultichain')} {<OpenInNewRoundedIcon htmlColor="#59A662" />}
        </Button>
      )}
    </>
  );
};

export const BridgeInfo = React.memo(_BridgeInfo);
