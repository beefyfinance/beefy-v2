import { Box, Button, CardContent, makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAllowanceAction } from '../../../features/data/actions/allowance';
import { askForNetworkChange, askForWalletConnection } from '../../../features/data/actions/wallet';
import { walletActions } from '../../../features/data/actions/wallet-actions';
import { isTokenErc20 } from '../../../features/data/entities/token';
import { selectAllowanceByTokenAddress } from '../../../features/data/selectors/allowances';
import { selectBridgeBifiDestChainData } from '../../../features/data/selectors/bridge';
import { selectChainById } from '../../../features/data/selectors/chains';
import { selectTokenByAddress } from '../../../features/data/selectors/tokens';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../features/data/selectors/wallet';
import { Divider } from '../../Divider';
import { Step } from '../../Steps/types';
import { styles } from '../styles';
import { useAppDispatch, useAppSelector } from '../../../store';

const useStyles = makeStyles(styles as any);

function _Confirm({
  handleModal,
  startStepper,
  isStepping,
}: {
  handleModal: () => void;
  startStepper: any;
  isStepping: boolean;
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const formState = useAppSelector(state => state.ui.bridgeModal);

  const walletAddress = useAppSelector(state =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  const currentChainId = useAppSelector(state => selectCurrentChainId(state));

  const isWalletOnFromChain = currentChainId === formState.fromChainId;

  const isWalletConnected = useAppSelector(selectIsWalletConnected);

  const fromChain = useAppSelector(state => selectChainById(state, formState.fromChainId));

  const destChain = useAppSelector(state => selectChainById(state, formState.destChainId));

  const destChainData = useAppSelector(state =>
    selectBridgeBifiDestChainData(state, fromChain.id, destChain.networkChainId)
  );
  const fromChainData = formState.bridgeDataByChainId[fromChain.id];

  const routerAddress = destChainData.DepositAddress ?? destChainData.routerToken;

  const depositedToken = useAppSelector(state =>
    selectTokenByAddress(state, formState.fromChainId, fromChainData.address)
  );

  React.useEffect(() => {
    //need to refresh the allowance
    if (isTokenErc20(depositedToken)) {
      dispatch(
        fetchAllowanceAction({
          chainId: formState.fromChainId,
          spenderAddress: routerAddress,
          tokens: [depositedToken],
        })
      );
    }
  }, [depositedToken, dispatch, formState.fromChainId, routerAddress]);

  const depositTokenAllowance = useAppSelector(state =>
    selectAllowanceByTokenAddress(
      state,
      formState.fromChainId,
      fromChainData.address,
      routerAddress
    )
  );

  const isRouter = useMemo(() => {
    if (['swapin', 'swapout'].includes(destChainData?.type)) {
      return false;
    }
    return true;
  }, [destChainData]);

  const handleBridge = () => {
    const steps: Step[] = [];
    if (
      depositTokenAllowance.isLessThan(formState.amount) &&
      isRouter &&
      depositedToken.type !== 'native'
    ) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: walletActions.approval(depositedToken, routerAddress),
        pending: false,
      });
    }

    steps.push({
      step: 'bridge',
      message: t('Vault-TxnConfirm', { type: t('Bridge-noun') }),
      action: walletActions.bridge(
        formState.fromChainId,
        formState.destChainId,
        routerAddress,
        formState.amount,
        isRouter
      ),
      pending: false,
    });

    handleModal();
    startStepper(steps);
  };

  const handleConnectWallet = () => {
    handleModal();
    dispatch(askForWalletConnection());
  };

  return (
    <CardContent className={classes.content}>
      <Box>
        <Typography variant="body1">{t('Bridge-Confirm-Content')}</Typography>
      </Box>
      <Box className={classes.fees}>
        <Box mb={1}>
          <Typography variant="body2" className={classes.label}>
            {t('FROM')}
          </Typography>
        </Box>
        <Box mb={1.5} className={classes.flexContainer}>
          <Box className={classes.networkContainer}>
            <img
              className={classes.icon}
              alt=""
              src={require(`../../../images/networks/${formState.fromChainId}.svg`).default}
            />
            <Typography className={classes.chainName} variant="body1">
              {fromChain.name}
            </Typography>
          </Box>
          <Typography className={classes.bridgedValue} variant="body1">
            - {formState.formattedInput} BIFI
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" className={classes.address}>
            {t('Address')}: <span>{walletAddress}</span>
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box className={clsx(classes.fees, classes.lastMarginFees)}>
        <Box mb={1}>
          <Typography variant="body2" className={classes.label}>
            {t('TO')}
          </Typography>
        </Box>
        <Box mb={2} className={classes.flexContainer}>
          <Box className={classes.networkContainer}>
            <img
              className={classes.icon}
              alt=""
              src={require(`../../../images/networks/${formState.destChainId}.svg`).default}
            />
            <Typography className={classes.chainName} variant="body1">
              {destChain.name}
            </Typography>
          </Box>
          <Typography className={classes.bridgedValue} variant="body1">
            + {formState.formattedOutput} BIFI
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" className={classes.address}>
            {t('Address')}: <span>{walletAddress}</span>
          </Typography>
        </Box>
      </Box>
      <Box mb={1} className={classes.flexContainer}>
        <ItemInfo title={t('Bridge-Crosschain')}>{destChainData.SwapFeeRatePerMillion}%</ItemInfo>
      </Box>
      <Box mb={1} className={classes.flexContainer}>
        <ItemInfo title={t('Bridge-Gas')}> {destChainData.MinimumSwapFee} BIFI</ItemInfo>
      </Box>
      <Box mb={3} className={classes.flexContainer}>
        <ItemInfo title={t('Bridge-EstimatedTime')}>3 - 30 min</ItemInfo>
      </Box>

      {isWalletConnected ? (
        isWalletOnFromChain ? (
          <Button onClick={handleBridge} disabled={isStepping} className={classes.btn}>
            {t('Confirm')}
          </Button>
        ) : (
          <Button
            onClick={() => dispatch(askForNetworkChange({ chainId: formState.fromChainId }))}
            className={classes.btn}
          >
            {t('Network-Change', { network: fromChain.name })}
          </Button>
        )
      ) : (
        <Button onClick={handleConnectWallet} className={classes.btn}>
          {t('Network-ConnectWallet')}
        </Button>
      )}
    </CardContent>
  );
}

export const Confirm = React.memo(_Confirm);

const ItemInfo = ({ title, children }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="body2" className={classes.advice1}>
        {title}
      </Typography>
      <Typography variant="body2" className={classes.value}>
        {children}
      </Typography>
    </>
  );
};
