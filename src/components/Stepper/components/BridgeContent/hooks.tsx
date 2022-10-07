import React, { useRef } from 'react';
import { getBridgeTxData } from '../../../../features/data/actions/bridge';
import { bridgeActions } from '../../../../features/data/reducers/wallet/bridge';
import { useAppDispatch, useAppSelector } from '../../../../store';

export interface TxStateInterface {
  error: string | null;
  swapTx: string | null;
  status: 0 | 3 | 10 | 8 | 9 | 12 | 14;
}
//FOR MORE INFO WATCH https://github.com/anyswap/CrossChain-Router/wiki/How-to-integrate-AnySwap-Router POINT 4

export function useBridgeStatus() {
  const [txData, setTxData] = React.useState<TxStateInterface>({
    error: null,
    swapTx: null,
    status: 0,
  });
  const walletActionsState = useAppSelector(state => state.user.walletActions);

  // Use a ref to keep track of a stateful value that doesn't affect rendering,
  // the `setInterval` ID in this case.
  const intervalRef: any = useRef();

  const hash =
    walletActionsState.result === 'success'
      ? walletActionsState.data.receipt.transactionHash
      : walletActionsState.result === 'success_pending'
      ? walletActionsState.data.hash
      : '';

  const dispatch = useAppDispatch();
  //TX DATA IS REFRESH EVERY 5 SECONDS
  React.useEffect(() => {
    const getTxData = () => {
      dispatch(bridgeActions.setStatus({ status: 'loading' }));
      getBridgeTxData(hash)
        .then(res => {
          if (res.msg === 'Error') {
            setTxData({
              error: res.error,
              swapTx: null,
              status: 0,
            });
          }
          if (res.msg === 'Success') {
            setTxData({
              swapTx: res.info.swaptx,
              error: null,
              status: res.info.status,
            });
            // STATUS 8 = Confirming \ STATUS 9 = Swapping
            if (res.info.status === 8 || res.info.status === 9) {
              dispatch(bridgeActions.setStatus({ status: 'confirming' }));
            }
            //STATUS 10 = Success
            if (res.info.status === 10) {
              dispatch(bridgeActions.setStatus({ status: 'success' }));
              clearInterval(intervalRef.current);
            }
            //STATUS 14= Failure
            if (res.info.status === 14) {
              dispatch(bridgeActions.setStatus({ status: 'idle' }));
              clearInterval(intervalRef.current);
            }
          }
        })
        .catch(err => {
          setTxData({
            swapTx: null,
            error: `Request Error ${err}`,
            status: 14,
          });
        });
    };

    intervalRef.current = setInterval(getTxData, 5000);

    return () => {
      clearInterval(intervalRef.current);
      dispatch(bridgeActions.setStatus({ status: 'idle' }));
    };
  }, [dispatch, hash]);

  return txData;
}
