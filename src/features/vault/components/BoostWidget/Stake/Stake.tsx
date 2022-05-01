import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import CloseIcon from '@material-ui/icons/Close';
import { Card } from '../../Card/Card';
import { CardHeader } from '../../Card/CardHeader';
import { CardContent } from '../../Card/CardContent';
import { CardTitle } from '../../Card/CardTitle';
import { formatBigNumberSignificant } from '../../../../../helpers/format';
import { askForNetworkChange, askForWalletConnection } from '../../../../data/actions/wallet';
import { BoostEntity } from '../../../../data/entities/boost';
import { useStepper } from '../../../../../components/Steps/hooks';
import { BeefyState } from '../../../../../redux-types';
import { selectBoostById, selectIsBoostActiveOrPreStake } from '../../../../data/selectors/boosts';
import { selectStandardVaultById } from '../../../../data/selectors/vaults';
import { boostModalActions } from '../../../../data/reducers/wallet/boost-modal';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../../data/selectors/wallet';
import { Step } from '../../../../../components/Steps/types';
import { selectIsApprovalNeededForBoostStaking } from '../../../../data/selectors/wallet-actions';
import { walletActions } from '../../../../data/actions/wallet-actions';
import { selectErc20TokenByAddress } from '../../../../data/selectors/tokens';
import {
  selectBoostUserBalanceInToken,
  selectUserBalanceOfToken,
} from '../../../../data/selectors/balance';
import { selectChainById } from '../../../../data/selectors/chains';
import { Loader } from '../../../../../components/loader';
import { initBoostForm } from '../../../../data/actions/scenarios';
import { isFulfilled } from '../../../../data/reducers/data-loader';
import { selectIsAddressBookLoaded } from '../../../../data/selectors/data-loader';

const useStyles = makeStyles(styles as any);

export const Stake = ({
  boostId,
  closeModal,
}: {
  boostId: BoostEntity['id'];
  closeModal: () => void;
}) => {
  const boost = useSelector((state: BeefyState) => selectBoostById(state, boostId));

  const formReady = useSelector(
    (state: BeefyState) =>
      selectIsAddressBookLoaded(state, boost.chainId) &&
      isFulfilled(state.ui.dataLoader.global.boostForm)
  );
  const walletAddress = useSelector((state: BeefyState) =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  // initialize our form
  const store = useStore();
  React.useEffect(() => {
    initBoostForm(store, boostId, 'stake', walletAddress);
  }, [store, boostId, walletAddress]);

  return formReady ? <StakeForm boostId={boostId} closeModal={closeModal} /> : <Loader />;
};

const StakeForm = ({
  boostId,
  closeModal,
}: {
  boostId: BoostEntity['id'];
  closeModal: () => void;
}) => {
  const boost = useSelector((state: BeefyState) => selectBoostById(state, boostId));
  const vault = useSelector((state: BeefyState) => selectStandardVaultById(state, boost.vaultId));
  const chain = useSelector((state: BeefyState) => selectChainById(state, boost.chainId));
  const mooToken = useSelector((state: BeefyState) =>
    selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );
  const isBoostDepositable = useSelector((state: BeefyState) =>
    selectIsBoostActiveOrPreStake(state, boostId)
  );

  const mooBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, boost.chainId, mooToken.id)
  );
  const boostBalance = useSelector((state: BeefyState) =>
    selectBoostUserBalanceInToken(state, boost.id)
  );

  const isWalletConnected = useSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const store = useStore();
  const formState = useSelector((state: BeefyState) => state.ui.boostModal);

  const [startStepper, isStepping, Stepper] = useStepper(vault.id);

  const spenderAddress = boost.earnContractAddress;

  const needsApproval = useSelector((state: BeefyState) =>
    selectIsApprovalNeededForBoostStaking(state, spenderAddress)
  );

  const handleInput = (amountStr: string) => {
    dispatch(boostModalActions.setInput({ amount: amountStr, state: store.getState() }));
  };

  const handleMax = () => {
    dispatch(boostModalActions.setMax({ state: store.getState() }));
  };

  const handleDeposit = () => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    if (needsApproval) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: walletActions.approval(mooToken, spenderAddress),
        pending: false,
      });
    }

    steps.push({
      step: 'stake',
      message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
      action: walletActions.stakeBoost(boost, formState.amount),
      pending: false,
    });

    startStepper(steps);
  };

  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: 24,
    minWidth: '400px',
  };

  return (
    <>
      <Box sx={style}>
        <Card>
          <CardHeader className={classes.header}>
            <CardTitle titleClassName={classes.title} title={t('Stake-Modal-Title')} />
            <IconButton className={classes.removeHover} onClick={closeModal} aria-label="settings">
              <CloseIcon htmlColor="#8A8EA8" />
            </IconButton>
          </CardHeader>
          <CardContent className={classes.content}>
            <Box className={classes.inputContainer}>
              <Box className={classes.balances}>
                <Box className={classes.available}>
                  <Typography className={classes.label}>{t('Stake-Label-Available')}</Typography>
                  <Typography className={classes.value}>
                    {formatBigNumberSignificant(mooBalance)}
                  </Typography>
                </Box>
                <Box className={classes.staked}>
                  <Typography className={classes.label}>{t('Stake-Label-Staked')}</Typography>
                  <Typography className={classes.value}>
                    {formatBigNumberSignificant(boostBalance)}
                  </Typography>
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
              {!isBoostDepositable ? (
                <Button className={classes.btnSubmit} fullWidth={true} disabled={true}>
                  {t('Deposit-Disabled')}
                </Button>
              ) : isWalletConnected ? (
                !isWalletOnVaultChain ? (
                  <Button
                    onClick={() => dispatch(askForNetworkChange({ chainId: boost.chainId }))}
                    className={classes.btnSubmit}
                    fullWidth={true}
                    disabled={isStepping}
                  >
                    {t('Network-Change', { network: chain.name.toUpperCase() })}
                  </Button>
                ) : (
                  <Button
                    onClick={handleDeposit}
                    className={classes.btnSubmit}
                    fullWidth={true}
                    disabled={formState.amount.isLessThanOrEqualTo(0) || isStepping}
                  >
                    {t('Stake-Button-ConfirmStaking')}
                  </Button>
                )
              ) : (
                <Button
                  className={classes.btnSubmit}
                  fullWidth={true}
                  onClick={() => dispatch(askForWalletConnection())}
                  disabled={isStepping}
                >
                  {t('Network-ConnectWallet')}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Stepper />
    </>
  );
};
