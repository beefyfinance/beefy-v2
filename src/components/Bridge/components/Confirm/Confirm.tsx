import { CardContent, makeStyles } from '@material-ui/core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAllowanceAction } from '../../../../features/data/actions/allowance';
import {
  askForNetworkChange,
  askForWalletConnection,
} from '../../../../features/data/actions/wallet';
import { walletActions } from '../../../../features/data/actions/wallet-actions';
import { isTokenErc20 } from '../../../../features/data/entities/token';
import { selectAllowanceByTokenAddress } from '../../../../features/data/selectors/allowances';
import { selectBridgeBifiDestChainData } from '../../../../features/data/selectors/bridge';
import { selectChainById } from '../../../../features/data/selectors/chains';
import { selectTokenByAddress } from '../../../../features/data/selectors/tokens';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../../features/data/selectors/wallet';
import { Divider } from '../../../Divider';
import { Step } from '../../../Steps/types';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { Button } from '../../../Button';
import { styles } from './styles';
import { formatAddressShort } from '../../../../helpers/format';

const useStyles = makeStyles(styles);

function _Confirm({
  handleModal,
  handleBack,
  startStepper,
  isStepping,
}: {
  handleModal: () => void;
  handleBack: () => void;
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
      <div className={classes.confirmIntro}> {t('Bridge-Confirm-Content')} </div>
      <div className={classes.transferInfo}>
        <div className={classes.label}>{t('FROM')}</div>
        <div className={classes.networkAmount}>
          <div className={classes.network}>
            <img
              className={classes.networkIcon}
              width={20}
              height={20}
              alt=""
              src={require(`../../../../images/networks/${formState.fromChainId}.svg`).default}
            />
            <div className={classes.networkName}>{fromChain.name}</div>
          </div>
          <div className={classes.amount}>- {formState.formattedInput} BIFI</div>
        </div>
        <div className={classes.address}>
          {t('Address')}: <span>{formatAddressShort(walletAddress)}</span>
        </div>
      </div>
      <Divider />
      <div className={classes.transferInfo}>
        <div className={classes.label}>{t('TO')}</div>
        <div className={classes.networkAmount}>
          <div className={classes.network}>
            <img
              className={classes.networkIcon}
              width={20}
              height={20}
              alt=""
              src={require(`../../../../images/networks/${formState.destChainId}.svg`).default}
            />
            <div className={classes.networkName}>{destChain.name}</div>
          </div>
          <div className={classes.amount}>+ {formState.formattedOutput} BIFI</div>
        </div>
        <div className={classes.address}>
          {t('Address')}: <span>{formatAddressShort(walletAddress)}</span>
        </div>
      </div>
      <div className={classes.transferDetails}>
        <ItemInfo title={t('Bridge-Crosschain')}>{destChainData.SwapFeeRatePerMillion}%</ItemInfo>
        <ItemInfo title={t('Bridge-Gas')}> {destChainData.MinimumSwapFee} BIFI</ItemInfo>
        <ItemInfo title={t('Bridge-EstimatedTime')}>3 - 30 min</ItemInfo>
      </div>
      <div className={classes.buttonsContainer}>
        {isWalletConnected ? (
          isWalletOnFromChain ? (
            <Button
              onClick={handleBridge}
              disabled={isStepping}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Confirm')}
            </Button>
          ) : (
            <Button
              onClick={() => dispatch(askForNetworkChange({ chainId: formState.fromChainId }))}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Network-Change', { network: fromChain.name })}
            </Button>
          )
        ) : (
          <Button
            onClick={handleConnectWallet}
            variant="success"
            fullWidth={true}
            borderless={true}
          >
            {t('Network-ConnectWallet')}
          </Button>
        )}
        <Button onClick={handleBack} variant="light" fullWidth={true} borderless={true}>
          {t('Back')}
        </Button>
      </div>
    </CardContent>
  );
}

export const Confirm = React.memo(_Confirm);

const ItemInfo = ({ title, children }) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.detailLabel}>{title}</div>
      <div className={classes.detailValue}>{children}</div>
    </>
  );
};
