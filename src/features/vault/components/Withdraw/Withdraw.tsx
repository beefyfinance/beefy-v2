import {
  Box,
  Button,
  FormControlLabel,
  InputBase,
  makeStyles,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { isArray } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { AssetsImage } from '../../../../components/AssetsImage';
import { useStepper } from '../../../../components/Steps/hooks';
import { Step } from '../../../../components/Steps/types';
import { BIG_ZERO, formatBigNumberSignificant } from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { initWithdrawForm } from '../../../data/actions/scenarios';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';
import { walletActions } from '../../../data/actions/wallet-actions';
import { TokenEntity } from '../../../data/entities/token';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { isFulfilled } from '../../../data/reducers/data-loader';
import { withdrawActions } from '../../../data/reducers/wallet/withdraw';
import {
  selectBoostUserBalanceInToken,
  selectGovVaultPendingRewardsInToken,
  selectGovVaultUserStackedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoosts,
  selectUserBalanceOfToken,
} from '../../../data/selectors/balance';
import {
  selectBoostById,
  selectIsVaultPreStakedOrBoosted,
  selectPreStakeOrActiveBoostIds,
  selectShouldDisplayBoostWidget,
} from '../../../data/selectors/boosts';
import { selectChainById } from '../../../data/selectors/chains';
import { selectIsAddressBookLoaded } from '../../../data/selectors/data-loader';
import {
  selectChainWrappedNativeToken,
  selectErc20TokenByAddress,
  selectTokenByAddress,
} from '../../../data/selectors/tokens';
import { selectVaultById } from '../../../data/selectors/vaults';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../data/selectors/wallet';
import { selectIsApprovalNeededForWithdraw } from '../../../data/selectors/wallet-actions';
import { BoostWidget } from '../BoostWidget';
import { FeeBreakdown } from '../FeeBreakdown';
import { styles } from '../styles';
import { TokenWithDeposit } from '../TokenWithDeposit';
import { EmeraldGasNotice } from '../EmeraldGasNotice/EmeraldGasNotice';

const useStyles = makeStyles(styles as any);

export const Withdraw = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const store = useStore();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isWalletConnected = useSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );
  const walletAddress = useSelector((state: BeefyState) =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  // initialize our form
  React.useEffect(() => {
    initWithdrawForm(store, vaultId, walletAddress);
    // reset form on unmount
    return () => {
      store.dispatch(withdrawActions.resetForm());
    };
  }, [store, vaultId, walletAddress]);

  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));
  const depositToken = useSelector((state: BeefyState) =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const earnedToken = useSelector((state: BeefyState) =>
    selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress, true)
  );
  const formState = useSelector((state: BeefyState) => state.ui.withdraw);
  const wnative = useSelector((state: BeefyState) =>
    selectIsAddressBookLoaded(state, vault.chainId)
      ? selectChainWrappedNativeToken(state, vault.chainId)
      : null
  );

  const spenderAddress = formState.isZap
    ? formState.zapOptions?.address || null
    : // if it's a classic vault, the vault contract address is the spender
      // which is also the earned token
      vault.earnContractAddress;

  // no approval when retrieving the vault LP
  const isWithdrawingLP =
    formState.selectedToken &&
    !isArray(formState.selectedToken) &&
    formState.selectedToken.address === depositToken.address;

  const needsApproval = useSelector((state: BeefyState) =>
    formState.vaultId && spenderAddress && !isWithdrawingLP
      ? selectIsApprovalNeededForWithdraw(state, spenderAddress)
      : false
  );

  const formDataLoaded = useSelector(
    (state: BeefyState) =>
      isFulfilled(state.ui.dataLoader.byChainId[vault.chainId].addressBook) &&
      isFulfilled(state.ui.dataLoader.global.withdrawForm)
  );

  const isZapEstimateLoading = formState.isZap && !formState.zapEstimate;
  const [startStepper, isStepping, Stepper] = useStepper(vault.id);

  const formReady = formDataLoaded && !isStepping && !isZapEstimateLoading;

  const hasGovVaultRewards = useSelector((state: BeefyState) =>
    selectGovVaultPendingRewardsInToken(state, vaultId).isGreaterThan(0)
  );
  // TODO: this could be a selector or hook
  const userHasBalanceInVault = useSelector((state: BeefyState) => {
    const deposit = isGovVault(vault)
      ? selectGovVaultUserStackedBalanceInDepositToken(state, vault.id)
      : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);
    return deposit.isGreaterThan(0);
  });
  const displayBoostWidget = useSelector((state: BeefyState) =>
    selectShouldDisplayBoostWidget(state, vaultId)
  );

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
        action: walletActions.unstakeGovVault(vault, formState.amount),
        pending: false,
      });
    } else {
      if (formState.isZap) {
        if (needsApproval && formState.zapEstimate) {
          steps.push({
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: walletActions.approval(earnedToken, spenderAddress),
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

  const isBoosted = useSelector((state: BeefyState) =>
    selectIsVaultPreStakedOrBoosted(state, vaultId)
  );

  const activeBoost = useSelector((state: BeefyState) =>
    isBoosted ? selectBoostById(state, selectPreStakeOrActiveBoostIds(state, vaultId)[0]) : null
  );

  const boost = useSelector((state: BeefyState) =>
    isBoosted ? selectBoostById(state, activeBoost.id) : null
  );

  const boostBalance = useSelector((state: BeefyState) =>
    isBoosted ? selectBoostUserBalanceInToken(state, boost.id) : new BigNumber(BIG_ZERO)
  );

  const mooBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, earnedToken.address)
  );

  const showDepositedText =
    isBoosted && formState.zapOptions !== null && boostBalance.isGreaterThan(0) ? false : true;

  return (
    <>
      <Box p={3}>
        {formState.zapOptions !== null && (
          <>
            {isBoosted && boostBalance.isGreaterThan(0) && (
              <Box className={classes.assetsDivider}>
                <Box className={classes.width50}>
                  <Typography className={classes.balanceText}>{t('Vault-Deposited')}</Typography>
                  <Box className={classes.stakedInValue}>
                    <AssetsImage chainId={vault.chainId} assetIds={vault.assetIds} size={24} />
                    <Typography variant="body1">{`${formatBigNumberSignificant(
                      mooBalance,
                      4
                    )} LP`}</Typography>
                  </Box>
                </Box>
                <Box mb={3}>
                  <Typography className={classes.balanceText}>{t('Vault-StakedIn')}</Typography>
                  <Box className={classes.stakedInValue}>
                    <AssetsImage chainId={vault.chainId} assetIds={vault.assetIds} size={24} />
                    <Typography
                      className={classes.orange}
                      variant="body1"
                    >{`${formatBigNumberSignificant(boostBalance, 4)} ${
                      vault.assetIds.length > 1 ? 'LP' : ''
                    }`}</Typography>
                  </Box>
                </Box>
              </Box>
            )}
            <Typography variant="body1" className={classes.zapPromotion}>
              {t('Zap-Promotion', {
                action: 'Withdraw',
                token1: vault.assetIds[0],
                token2: vault.assetIds[1],
              })}
            </Typography>
          </>
        )}
        <Box display="flex">
          <Box
            className={clsx(
              isBoosted && boostBalance.isGreaterThan(0) && formState.zapOptions === null
                ? classes.width50
                : classes.width100
            )}
          >
            {showDepositedText && (
              <Box mb={1}>
                <Typography className={classes.balanceText}>{t('Vault-Deposited')}</Typography>
              </Box>
            )}

            <RadioGroup
              className={classes.removeLastItemMargin}
              value={
                isArray(formState.selectedToken)
                  ? formState.selectedToken.map(t => t.id).join('+')
                  : formState.selectedToken
                  ? formState.selectedToken.id
                  : ''
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
              <FormControlLabel
                className={classes.depositTokenContainer}
                value={depositToken.id}
                control={formState.zapOptions !== null ? <Radio /> : <div style={{ width: 12 }} />}
                label={<TokenWithDeposit vaultId={vaultId} />}
                onClick={formState.isZap ? undefined : handleMax}
                disabled={!formReady}
              />
              {formState.zapOptions !== null && (
                <FormControlLabel
                  className={classes.depositTokenContainer}
                  value={vault.assetIds.join('+')}
                  control={<Radio />}
                  label={<TokenWithDeposit convertAmountTo={vault.assetIds} vaultId={vaultId} />}
                  disabled={!formReady}
                />
              )}
              {formState.zapOptions?.tokens.map(
                (zapToken, i) =>
                  wnative &&
                  zapToken.id !== wnative.id && (
                    <FormControlLabel
                      key={i}
                      className={classes.depositTokenContainer}
                      value={zapToken.id}
                      control={<Radio />}
                      label={<TokenWithDeposit convertAmountTo={zapToken.id} vaultId={vaultId} />}
                      disabled={!formReady}
                    />
                  )
              )}
            </RadioGroup>
          </Box>
          {isBoosted && boostBalance.isGreaterThan(0) && formState.zapOptions === null && (
            <Box>
              <Box mb={1}>
                <Typography className={classes.balanceText}>{t('Vault-StakedIn')}</Typography>
              </Box>
              <Box className={classes.stakedInValue}>
                <AssetsImage chainId={vault.chainId} assetIds={vault.assetIds} size={16} />
                <Typography
                  className={classes.orange}
                  variant="body1"
                >{`${formatBigNumberSignificant(boostBalance, 4)} ${
                  vault.assetIds.length > 1 ? 'LP' : ''
                }`}</Typography>
              </Box>
            </Box>
          )}
        </Box>
        <Box className={classes.inputContainer}>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage
                chainId={vault.chainId}
                assetIds={
                  !formState.selectedToken
                    ? vault.assetIds
                    : isArray(formState.selectedToken)
                    ? formState.selectedToken.map(t => t.id)
                    : formState.selectedToken.address === depositToken.address
                    ? vault.assetIds
                    : [formState.selectedToken.id]
                }
                size={20}
              />
            </Box>
            <InputBase
              placeholder="0.00"
              value={formState.formattedInput}
              onChange={e => handleInput(e.target.value)}
              disabled={!formReady}
            />
            <Button onClick={handleMax} disabled={!formReady}>
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
        <Box mt={3}>
          {vault.chainId === 'oasis' ? <EmeraldGasNotice /> : null}
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
                      disabled={!hasGovVaultRewards || !formReady}
                      className={classes.btnSubmit}
                      fullWidth={true}
                    >
                      {t('ClaimRewards-noun')}
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      className={classes.btnSubmit}
                      fullWidth={true}
                      disabled={formState.amount.isLessThanOrEqualTo(0) || !formReady}
                    >
                      {formState.max ? t('Withdraw-All') : t('Withdraw-Verb')}
                    </Button>
                    <Button
                      onClick={handleExit}
                      disabled={!userHasBalanceInVault || !formReady}
                      className={classes.btnSubmit}
                      fullWidth={true}
                    >
                      {t('Claim-And-Withdraw-All')}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleWithdraw}
                    className={classes.btnSubmit}
                    fullWidth={true}
                    disabled={formState.amount.isLessThanOrEqualTo(0) || !formReady}
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
