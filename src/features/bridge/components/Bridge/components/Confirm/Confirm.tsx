import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button';
import { Divider } from '../../../../../../components/Divider';
import { formatAddressShort } from '../../../../../../helpers/format';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { fetchAllowanceAction } from '../../../../../data/actions/allowance';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import { isTokenErc20 } from '../../../../../data/entities/token';
import { selectAllowanceByTokenAddress } from '../../../../../data/selectors/allowances';
import {
  selectBridgeBifiDestChainData,
  selectBridgeState,
} from '../../../../../data/selectors/bridge';
import { selectChainById } from '../../../../../data/selectors/chains';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../../../data/selectors/wallet';
import { styles } from './styles';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc';
import { stepperActions } from '../../../../../data/reducers/wallet/stepper';
import { startStepper } from '../../../../../data/actions/stepper';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';

const useStyles = makeStyles(styles);

function _Confirm() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const formState = useAppSelector(selectBridgeState);

  const walletAddress = useAppSelector(state =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  const currentChainId = useAppSelector(selectCurrentChainId);

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

  const isStepping = useAppSelector(selectIsStepperStepping);

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
    if (
      depositTokenAllowance.isLessThan(formState.amount) &&
      isRouter &&
      depositedToken.type !== 'native'
    ) {
      dispatch(
        stepperActions.addStep({
          step: {
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: walletActions.approval(depositedToken, routerAddress),
            pending: false,
          },
        })
      );
    }

    dispatch(
      stepperActions.addStep({
        step: {
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
        },
      })
    );

    dispatch(startStepper(fromChain.id));
  };

  const handleConnectWallet = () => {
    dispatch(askForWalletConnection());
  };

  return (
    <>
      <div className={classes.infoContainer}>
        <div className={classes.transferInfo}>
          <div className={classes.label}>{t('FROM')}</div>
          <div className={classes.networkAmount}>
            <div className={classes.network}>
              <img
                className={classes.networkIcon}
                width={20}
                height={20}
                alt=""
                src={getNetworkSrc(formState.fromChainId)}
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
                src={getNetworkSrc(formState.destChainId)}
              />
              <div className={classes.networkName}>{destChain.name}</div>
            </div>
            <div className={classes.amount}>+ {formState.formattedOutput} BIFI</div>
          </div>
          <div className={classes.address}>
            {t('Address')}: <span>{formatAddressShort(walletAddress)}</span>
          </div>
        </div>
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
      </div>
      <div className={classes.transferDetails}>
        <ItemInfo title={t('Bridge-Crosschain')}>{destChainData.SwapFeeRatePerMillion}%</ItemInfo>
        <ItemInfo title={t('Bridge-Gas')}> {destChainData.MinimumSwapFee} BIFI</ItemInfo>
        <ItemInfo title={t('Bridge-EstimatedTime')}>3 - 30 min</ItemInfo>
      </div>
    </>
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
