import { CardContent, Box, Typography, Button, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllowanceAction } from '../../../features/data/actions/allowance';
import { askForNetworkChange, askForWalletConnection } from '../../../features/data/actions/wallet';
import { walletActions } from '../../../features/data/actions/wallet-actions';
import { isTokenErc20 } from '../../../features/data/entities/token';
import { selectAllowanceByTokenAddress } from '../../../features/data/selectors/allowances';
import { selectBifiDestChainData } from '../../../features/data/selectors/bridge';
import { selectChainById } from '../../../features/data/selectors/chains';
import { selectTokenByAddress } from '../../../features/data/selectors/tokens';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../features/data/selectors/wallet';
import { BeefyState } from '../../../redux-types';
import { Step } from '../../Steps/types';
import { styles } from '../styles';

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
  const dispatch = useDispatch();

  const formState = useSelector((state: BeefyState) => state.ui.bridgeModal);

  const walletAddress = useSelector((state: BeefyState) =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  const currentChainId = useSelector((state: BeefyState) => selectCurrentChainId(state));

  const isWalletOnFromChain = currentChainId === formState.fromChainId;

  const isWalletConnected = useSelector(selectIsWalletConnected);

  const fromChain = useSelector((state: BeefyState) =>
    selectChainById(state, formState.fromChainId)
  );

  const destChain = useSelector((state: BeefyState) =>
    selectChainById(state, formState.destChainId)
  );

  const destChainData = useSelector((state: BeefyState) =>
    selectBifiDestChainData(state, destChain.networkChainId)
  );

  const routerAddress = destChainData.DepositAddress ?? destChainData.routerToken;

  const depositedToken = useSelector((state: BeefyState) =>
    selectTokenByAddress(state, formState.fromChainId, formState.bridgeFromData.address)
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

  const depositTokenAllowance = useSelector((state: BeefyState) =>
    selectAllowanceByTokenAddress(
      state,
      formState.fromChainId,
      formState.bridgeFromData.address,
      routerAddress
    )
  );

  const isRouter = useMemo(() => {
    if (['swapin', 'swapout'].includes(destChainData?.type)) {
      return false;
    }
    return true;
  }, [destChainData]);

  const handleDeposit = () => {
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
      <Box className={classes.customDivider}>
        <Box className={classes.line} />
        <img alt="arrowDown" src={require('../../../images/arrowDown.svg').default} />
        <Box className={classes.line} />
      </Box>
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
        <Typography variant="body2" className={classes.advice1}>
          {t('Bridge-Crosschain')}:
        </Typography>
        <Typography variant="body2" className={classes.value}>
          {destChainData.SwapFeeRatePerMillion}%
        </Typography>
      </Box>
      <Box mb={1} className={classes.flexContainer}>
        <Typography variant="body2" className={classes.advice1}>
          {t('Bridge-Gas')}:
        </Typography>
        <Typography variant="body2" className={classes.value}>
          {destChainData.MinimumSwapFee} BIFI
        </Typography>
      </Box>
      <Box mb={3} className={classes.flexContainer}>
        <Typography variant="body2" className={classes.advice1}>
          {t('Bridge-EstimatedTime')}
        </Typography>
        <Typography variant="body2" className={classes.value}>
          3 - 30 min
        </Typography>
      </Box>

      {isWalletConnected ? (
        isWalletOnFromChain ? (
          <Button onClick={handleDeposit} disabled={isStepping} className={classes.btn}>
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
