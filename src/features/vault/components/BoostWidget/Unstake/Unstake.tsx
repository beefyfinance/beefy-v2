import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  makeStyles,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatBigNumberSignificant } from '../../../../../helpers/format';
import CloseIcon from '@material-ui/icons/Close';
import { Card, CardContent, CardHeader, CardTitle } from '../../Card';
import { styles } from './styles';
import { askForNetworkChange, askForWalletConnection } from '../../../../data/actions/wallet';
import { Loader } from '../../../../../components/Loader';
import { initBoostForm } from '../../../../data/actions/scenarios';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../../data/selectors/wallet';
import { BoostEntity } from '../../../../data/entities/boost';
import { selectBoostById } from '../../../../data/selectors/boosts';
import { selectStandardVaultById } from '../../../../data/selectors/vaults';
import { selectChainById } from '../../../../data/selectors/chains';
import { selectErc20TokenByAddress } from '../../../../data/selectors/tokens';
import {
  selectBoostUserBalanceInToken,
  selectUserBalanceOfToken,
} from '../../../../data/selectors/balance';
import { useStepper } from '../../../../../components/Steps/hooks';
import { boostModalActions } from '../../../../data/reducers/wallet/boost-modal';
import { Step } from '../../../../../components/Steps/types';
import { walletActions } from '../../../../data/actions/wallet-actions';
import { selectIsAddressBookLoaded } from '../../../../data/selectors/data-loader';
import { useAppDispatch, useAppSelector, useAppStore } from '../../../../../store';
import { Button } from '../../../../../components/Button';
import { isFulfilled } from '../../../../data/reducers/data-loader-types';

const useStyles = makeStyles(styles);

export const Unstake = ({
  boostId,
  closeModal,
}: {
  boostId: BoostEntity['id'];
  closeModal: () => void;
}) => {
  const boost = useAppSelector(state => selectBoostById(state, boostId));

  const formReady = useAppSelector(
    state =>
      selectIsAddressBookLoaded(state, boost.chainId) &&
      isFulfilled(state.ui.dataLoader.global.boostForm)
  );
  const walletAddress = useAppSelector(state =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  // initialize our form
  const store = useAppStore();
  React.useEffect(() => {
    initBoostForm(store, boostId, 'unstake', walletAddress);
  }, [store, boostId, walletAddress]);

  return formReady ? <UnstakeForm boostId={boostId} closeModal={closeModal} /> : <Loader />;
};

const UnstakeForm = ({
  boostId,
  closeModal,
}: {
  boostId: BoostEntity['id'];
  closeModal: () => void;
}) => {
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const vault = useAppSelector(state => selectStandardVaultById(state, boost.vaultId));
  const chain = useAppSelector(state => selectChainById(state, boost.chainId));
  const mooToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );

  const mooBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, boost.chainId, mooToken.address)
  );
  const boostBalance = useAppSelector(state => selectBoostUserBalanceInToken(state, boost.id));

  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useAppSelector(
    state => selectCurrentChainId(state) === vault.chainId
  );
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const store = useAppStore();
  const formState = useAppSelector(state => state.ui.boostModal);

  const [startStepper, isStepping, Stepper] = useStepper(chain.id);

  const handleInput = (amountStr: string) => {
    dispatch(
      boostModalActions.setInput({ amount: amountStr, withdraw: true, state: store.getState() })
    );
  };

  const handleMax = () => {
    dispatch(boostModalActions.setMax({ state: store.getState() }));
  };

  const handleUnstake = () => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    steps.push({
      step: 'stake',
      message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
      action: walletActions.unstakeBoost(boost, formState.amount),
      pending: false,
    });

    startStepper(steps);
  };

  return (
    <>
      <div className={classes.container}>
        <Card>
          <CardHeader className={classes.header}>
            <CardTitle titleClassName={classes.title} title={t('Unstake-Modal-Title')} />
            <IconButton className={classes.closeIcon} onClick={closeModal} aria-label="settings">
              <CloseIcon htmlColor="#8A8EA8" />
            </IconButton>
          </CardHeader>
          <CardContent className={classes.content}>
            <Box className={classes.inputContainer}>
              <Box className={classes.balances}>
                <Box className={classes.available}>
                  <div className={classes.label}>{t('Stake-Label-Available')}</div>
                  <div className={classes.value}>{formatBigNumberSignificant(mooBalance)}</div>
                </Box>
                <Box className={classes.staked}>
                  <div className={classes.label}>{t('Stake-Label-Staked')}</div>
                  <div className={classes.value}>{formatBigNumberSignificant(boostBalance)}</div>
                </Box>
              </Box>
              <Box pt={2}>
                <FormControl className={classes.width} variant="filled">
                  <InputBase
                    placeholder="0.00"
                    className={classes.input}
                    value={formState.formattedInput}
                    onChange={e => handleInput(e.target.value)}
                    disabled={isStepping}
                    endAdornment={
                      <InputAdornment className={classes.positionButton} position="end">
                        <IconButton
                          size="small"
                          className={classes.maxButton}
                          aria-label="max button"
                          onClick={handleMax}
                          edge="end"
                        >
                          {' '}
                          Max
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Box>
            </Box>
            {/*BUTTON */}
            <Box className={classes.btnSection}>
              {isWalletConnected ? (
                !isWalletOnVaultChain ? (
                  <Button
                    onClick={() => dispatch(askForNetworkChange({ chainId: boost.chainId }))}
                    className={classes.btnSubmit}
                    fullWidth={true}
                    borderless={true}
                    variant="success"
                    disabled={isStepping}
                  >
                    {t('Network-Change', { network: chain.name.toUpperCase() })}
                  </Button>
                ) : (
                  <Button
                    onClick={handleUnstake}
                    className={classes.btnSubmit}
                    fullWidth={true}
                    borderless={true}
                    variant="success"
                    disabled={formState.amount.isLessThanOrEqualTo(0) || isStepping}
                  >
                    {t('Stake-Button-ConfirmUnstaking')}
                  </Button>
                )
              ) : (
                <Button
                  className={classes.btnSubmit}
                  fullWidth={true}
                  borderless={true}
                  variant="success"
                  onClick={() => dispatch(askForWalletConnection())}
                  disabled={isStepping}
                >
                  {t('Network-ConnectWallet')}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </div>
      <Stepper />
    </>
  );
};
