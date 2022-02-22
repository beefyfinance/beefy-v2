import {
  Box,
  Button,
  InputBase,
  makeStyles,
  Paper,
  Typography,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../../../components/loader';
import { AssetsImage } from '../../../../components/AssetsImage';
import { FeeBreakdown } from '../FeeBreakdown';
import { styles } from '../styles';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';
import { BeefyState } from '../../../../redux-types';
import { isFulfilled } from '../../../data/reducers/data-loader';
import { initWithdrawForm } from '../../../data/actions/scenarios';
import { isGovVault, isStandardVault, VaultEntity } from '../../../data/entities/vault';
import { Step } from '../../../../components/Steps/types';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectWalletAddress,
} from '../../../data/selectors/wallet';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectChainById } from '../../../data/selectors/chains';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectErc20TokenById,
  selectTokenById,
} from '../../../data/selectors/tokens';
import { useStepper } from '../../../../components/Steps/hooks';
import { walletActions } from '../../../data/actions/wallet-actions';
import { selectIsApprovalEnoughForWithdraw } from '../../../data/selectors/deposit';
import { withdrawActions } from '../../../data/reducers/wallet/withdraw';
import { TokenEntity } from '../../../data/entities/token';
import {
  selectGovVaultPendingRewardsInToken,
  selectUserVaultDepositInToken,
} from '../../../data/selectors/balance';
import { VaultBuyLinks, VaultBuyLinks2 } from '../VaultBuyLinks';
import { isArray } from 'lodash';
import { TokenWithDeposit } from '../TokenWithDeposit';
import { BoostWidget } from '../BoostWidget';
import { selectShouldDisplayBoostWidget } from '../../../data/selectors/boosts';

const useStyles = makeStyles(styles as any);

export const Withdraw = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const formReady = useSelector(
    (state: BeefyState) =>
      isFulfilled(state.ui.dataLoader.byChainId[vault.chainId].addressBook) &&
      isFulfilled(state.ui.dataLoader.global.withdrawForm)
  );
  const walletAddress = useSelector((state: BeefyState) =>
    selectIsWalletConnected(state) ? selectWalletAddress(state) : null
  );

  // initialize our form
  const store = useStore();
  React.useEffect(() => {
    initWithdrawForm(store, vaultId, walletAddress);
  }, [store, vaultId, walletAddress]);

  return formReady ? <WithdrawForm vaultId={vaultId} /> : <Loader />;
};

const WithdrawForm = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const store = useStore();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isWalletConnected = useSelector((state: BeefyState) => selectIsWalletConnected(state));
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );
  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));
  const oracleToken = useSelector((state: BeefyState) =>
    selectTokenById(state, vault.chainId, vault.oracleId)
  );
  const earnedToken = useSelector((state: BeefyState) =>
    selectErc20TokenById(state, vault.chainId, vault.earnedTokenId, true)
  );
  const formState = useSelector((state: BeefyState) => state.ui.withdraw);
  const native = useSelector((state: BeefyState) => selectChainNativeToken(state, vault.chainId));
  const wnative = useSelector((state: BeefyState) =>
    selectChainWrappedNativeToken(state, vault.chainId)
  );
  const isSelectedNative =
    !isArray(formState.selectedToken) && formState.selectedToken.id === native.id;

  const spenderAddress =
    // no allowance needed for native tokens
    isSelectedNative
      ? null
      : // if it's a zap, we spend with the zap contract
      formState.isZap
      ? formState.zapOptions?.address || null
      : // if it's a classic vault, the vault contract address is the spender
      // which is also the earned token
      isStandardVault(vault)
      ? vault.contractAddress
      : vault.earnContractAddress;

  const needsApproval = useSelector((state: BeefyState) =>
    !isSelectedNative && spenderAddress
      ? selectIsApprovalEnoughForWithdraw(state, spenderAddress)
      : false
  );

  const isZapEstimateLoading = formState.isZap && !formState.zapEstimate;

  const hasGovVaultRewards = useSelector((state: BeefyState) =>
    selectGovVaultPendingRewardsInToken(state, vaultId).isGreaterThan(0)
  );
  const userHasBalanceInVault = useSelector((state: BeefyState) =>
    selectUserVaultDepositInToken(state, vaultId).isGreaterThan(0)
  );
  const displayBoostWidget = useSelector((state: BeefyState) =>
    selectShouldDisplayBoostWidget(state, vaultId)
  );

  const [startStepper, isStepping, Stepper] = useStepper(vault.id, () => {});

  const handleWithdraw = () => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    if (isGovVault(vault)) {
      steps.push({
        step: 'withdraw',
        message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
        action: walletActions.unstake(vault, formState.amount),
        pending: false,
      });
    } else {
      if (formState.isZap) {
        if (needsApproval && formState.zapEstimate) {
          steps.push({
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: () => walletActions.approval(earnedToken, spenderAddress),
            pending: false,
          });
        }

        steps.push({
          step: 'withdraw',
          message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
          action: formState.isZapSwap
            ? walletActions.beefOutAndSwap(
                vault,
                formState.amount,
                formState.zapOptions,
                formState.zapEstimate,
                formState.slippageTolerance
              )
            : walletActions.beefOut(vault, formState.amount, formState.zapOptions),
          pending: false,
        });
      } else {
        steps.push({
          step: 'withdraw',
          message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
          action: walletActions.withdraw(vault, formState.amount, formState.max),
          pending: false,
        });
      }
    }

    startStepper(steps);
  };

  const handleClaim = () => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }
    if (!isGovVault(vault)) {
      return;
    }

    steps.push({
      step: 'claim',
      message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
      action: walletActions.claimGovVault(vault),
      pending: false,
    });

    startStepper(steps);
  };

  const handleExit = () => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }
    if (!isGovVault(vault)) {
      return;
    }

    steps.push({
      step: 'claim-withdraw',
      message: t('Vault-TxnConfirm', { type: t('Claim-Withdraw-noun') }),
      action: walletActions.exitGovVault(vault),
      pending: false,
    });

    startStepper(steps);
  };

  const handleAsset = (selectedToken: TokenEntity['id'] | TokenEntity['id'][]) => {
    dispatch(withdrawActions.setAsset({ selectedToken, state: store.getState() }));
  };

  const handleInput = (amountStr: string) => {
    dispatch(withdrawActions.setInput({ amount: amountStr, state: store.getState() }));
  };

  const handleMax = () => {
    dispatch(withdrawActions.setMax({ state: store.getState() }));
  };

  return (
    <>
      <Box p={3}>
        {formState.zapOptions !== null && (
          <Typography variant="body1" className={classes.zapPromotion}>
            {t('Zap-Promotion', {
              action: 'Withdraw',
              token1: vault.assetIds[0],
              token2: vault.assetIds[1],
            })}
          </Typography>
        )}
        <Typography className={classes.balanceText}>{t('Vault-Deposited')}</Typography>
        <RadioGroup
          value={
            isArray(formState.selectedToken)
              ? formState.selectedToken.map(t => t.id).join('+')
              : formState.selectedToken.id
          }
          aria-label="deposit-asset"
          name="deposit-asset"
          onChange={e => {
            const selected: string = e.target.value;
            if (vault.assetIds.join('+') === selected) {
              handleAsset(vault.assetIds);
            } else {
              handleAsset(selected);
            }
          }}
        >
          <div style={{ display: 'flex' }}>
            <FormControlLabel
              className={classes.depositTokenContainer}
              value={oracleToken.id}
              control={formState.zapOptions !== null ? <Radio /> : <div style={{ width: 12 }} />}
              label={<TokenWithDeposit vaultId={vaultId} />}
              onClick={formState.isZap ? undefined : handleMax}
              disabled={isStepping}
            />
            <VaultBuyLinks vaultId={vaultId} />
          </div>
          {formState.zapOptions !== null && (
            <FormControlLabel
              className={classes.depositTokenContainer}
              value={vault.assetIds.join('+')}
              control={<Radio />}
              label={<TokenWithDeposit convertAmountTo={vault.assetIds} vaultId={vaultId} />}
              disabled={isStepping}
            />
          )}
          {formState.zapOptions?.tokens.map(
            zapToken =>
              zapToken.id !== wnative.id && (
                <FormControlLabel
                  className={classes.depositTokenContainer}
                  value={zapToken.symbol}
                  control={<Radio />}
                  label={<TokenWithDeposit convertAmountTo={zapToken.id} vaultId={vaultId} />}
                  disabled={isStepping}
                />
              )
          )}
        </RadioGroup>

        <VaultBuyLinks2 vaultId={vaultId} />

        <Box className={classes.inputContainer}>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage img={vault.logoUri} assets={vault.assetIds} alt={vault.name} />
            </Box>
            <InputBase
              placeholder="0.00"
              value={formState.formattedInput}
              onChange={e => handleInput(e.target.value)}
              disabled={isStepping}
            />
            <Button onClick={handleMax} disabled={isStepping}>
              {t('Transact-Max')}
            </Button>
          </Paper>
        </Box>

        <FeeBreakdown
          vault={vault}
          slippageTolerance={formState.slippageTolerance}
          zapEstimate={formState.zapEstimate}
          isZapSwap={formState.isZapSwap}
          isZap={formState.isZap}
          type={'withdraw'}
        />
        <Box mt={2}>
          {isWalletConnected ? (
            !isWalletOnVaultChain ? (
              <>
                <Button
                  onClick={() => dispatch(askForNetworkChange({ chainId: vault.chainId }))}
                  className={classes.btnSubmit}
                  fullWidth={true}
                >
                  {t('Network-Change', { network: chain.name.toUpperCase() })}
                </Button>
              </>
            ) : (
              <>
                {isGovVault(vault) ? (
                  <>
                    <Button
                      onClick={handleClaim}
                      disabled={!hasGovVaultRewards || isStepping}
                      className={classes.btnSubmit}
                      fullWidth={true}
                    >
                      {t('ClaimRewards-noun')}
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      className={classes.btnSubmitSecondary}
                      fullWidth={true}
                      disabled={formState.amount.isLessThanOrEqualTo(0) || isStepping}
                    >
                      {formState.max ? t('Withdraw-All') : t('Withdraw-Verb')}
                    </Button>
                    <Button
                      onClick={handleExit}
                      disabled={!userHasBalanceInVault || isStepping}
                      className={classes.btnSubmitSecondary}
                      fullWidth={true}
                    >
                      {t('Claim-And-Withdraw')}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleWithdraw}
                    className={classes.btnSubmit}
                    fullWidth={true}
                    disabled={
                      formState.amount.isLessThanOrEqualTo(0) || isZapEstimateLoading || isStepping
                    }
                  >
                    {isZapEstimateLoading
                      ? t('Zap-Estimating')
                      : formState.max
                      ? t('Withdraw-All')
                      : t('Withdraw-Verb')}
                  </Button>
                )}
              </>
            )
          ) : (
            <Button
              className={classes.btnSubmit}
              fullWidth={true}
              onClick={() => dispatch(askForWalletConnection())}
            >
              {t('Network-ConnectWallet')}
            </Button>
          )}
        </Box>
      </Box>
      {displayBoostWidget && <BoostWidget vaultId={vaultId} />}
      <Stepper />
    </>
  );
};
