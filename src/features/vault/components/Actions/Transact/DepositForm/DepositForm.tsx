import { memo, type ReactNode, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import {
  selectTransactForceSelection,
  selectTransactNumTokens,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactSelected,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance.ts';
import { errorToString } from '../../../../../../helpers/format.ts';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { DepositTokenAmountInput } from '../DepositTokenAmountInput/DepositTokenAmountInput.tsx';
import { DepositBuyLinks } from '../DepositBuyLinks/DepositBuyLinks.tsx';
import { DepositActions } from '../DepositActions/DepositActions.tsx';
import { TransactQuote } from '../TransactQuote/TransactQuote.tsx';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import {
  TransactMode,
  TransactStatus,
} from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { RetirePauseReason } from '../../../RetirePauseReason/RetirePauseReason.tsx';
import {
  TokenAmount,
  TokenAmountFromEntity,
} from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { isVaultActive } from '../../../../../data/entities/vault.ts';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { TextLoader } from '../../../../../../components/TextLoader/TextLoader.tsx';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { Actions } from '../Actions/Actions.tsx';
import { styled } from '@repo/styles/jsx';
import { selectCurrentBoostByVaultIdOrUndefined } from '../../../../../data/selectors/boosts.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInShareTokenInCurrentBoost,
} from '../../../../../data/selectors/balance.ts';
import { useDispatch } from 'react-redux';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';
import { selectIsWalletConnected } from '../../../../../data/selectors/wallet.ts';
import { TokenImageFromEntity } from '../../../../../../components/TokenImage/TokenImage.tsx';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

type TokenInWalletProps = {
  token: TokenEntity;
  index: number;
};

const TokenInWallet = memo(function TokenInWallet({ token, index }: TokenInWalletProps) {
  const dispatch = useAppDispatch();
  const balance = useAppSelector(state =>
    token ? selectUserBalanceOfToken(state, token.chainId, token.address) : undefined
  );

  const handleMax = useCallback(() => {
    if (token && balance) {
      dispatch(
        transactActions.setInputAmount({
          index,
          amount: balance,
          max: true,
        })
      );
    }
  }, [balance, dispatch, token, index]);

  if (!token || !balance) {
    return <TextLoader placeholder="0.0000000 BNB-BIFI" />;
  }

  return <TokenAmountFromEntity onClick={handleMax} amount={balance} token={token} />;
});

const DepositFormLoader = memo(function DepositFormLoader() {
  const { t } = useTranslation();
  const status = useAppSelector(selectTransactOptionsStatus);
  const error = useAppSelector(selectTransactOptionsError);
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isLoading = status === TransactStatus.Idle || status === TransactStatus.Pending;
  const isError = status === TransactStatus.Rejected;

  return (
    <>
      {!isVaultActive(vault) ? (
        <Container>
          <RetirePauseReason vaultId={vaultId} />
        </Container>
      ) : isLoading ? (
        <Container>
          <LoadingIndicator text={t('Transact-Loading')} />
        </Container>
      ) : isError ? (
        <Container>
          <AlertError>{t('Transact-Options-Error', { error: errorToString(error) })}</AlertError>
        </Container>
      ) : (
        <Deposit />
      )}
    </>
  );
});

export const Deposit = memo(function Deposit() {
  return (
    <div>
      <Container>
        <DepositForm />
      </Container>
      <BoostPromotion />
    </div>
  );
});

export const BoostPromotion = memo(function BoostPromotion() {
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);

  const boost = useAppSelector(state => selectCurrentBoostByVaultIdOrUndefined(state, vaultId));
  const userDepositInVault = useAppSelector(state =>
    selectUserVaultBalanceInDepositToken(state, vaultId)
  );
  const userDepositInBoost = useAppSelector(state =>
    selectUserVaultBalanceInShareTokenInCurrentBoost(state, vaultId)
  );
  const dispatch = useDispatch();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);

  const handleTab = useCallback(() => {
    dispatch(transactActions.switchMode(TransactMode.Boost));
  }, [dispatch]);

  // Case 1:  no active boost or user deposited all in boost
  if (
    !boost ||
    (isWalletConnected && userDepositInBoost.gt(BIG_ZERO) && userDepositInVault.isZero())
  ) {
    return null;
  }

  //TODO: Handle multiple rewards
  const rewardToken = boost?.rewards[0];

  // Case 2: User has deposits but not in boost or partial boost
  if (!userDepositInVault.isZero()) {
    return (
      <BoostPromotionContainer>
        <BoostPromotionButton onClick={handleTab}>
          {t('Boost-Deposit-Notice-2')}{' '}
          <span className={css({ whiteSpace: 'nowrap' })}>
            <Trans
              i18nKey="Boost-Deposit-Rewards"
              components={{
                Token: (
                  <TokenImageFromEntity
                    token={rewardToken}
                    size={20}
                    css={{
                      display: 'inline-flex',
                      verticalAlign: 'middle',
                    }}
                  />
                ),
              }}
              values={{ symbol: rewardToken.symbol }}
            />
            <ChevronRight
              preserveAspectRatio="xMaxYMid"
              className={css({
                display: 'inline-flex',
                verticalAlign: 'middle',
                width: '12px', // svg is 6x9
              })}
            />
          </span>
        </BoostPromotionButton>
      </BoostPromotionContainer>
    );
  }

  return (
    <BoostPromotionContainer>
      {t('Boost-Deposit-Notice-1')}{' '}
      <Trans
        i18nKey="Boost-Deposit-Rewards"
        components={{ Token: <TokenImageFromEntity token={rewardToken} size={20} /> }}
        values={{ symbol: rewardToken.symbol }}
        css={{ display: 'inline-flex', verticalAlign: 'middle' }}
      />
    </BoostPromotionContainer>
  );
});

export const DepositForm = memo(function DepositForm() {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <div className={classes.inputs}>
        <DepositFormInputs />
      </div>
      <DepositBuyLinks css={styles.links} />
      <TransactQuote title={t('Transact-YouDeposit')} css={styles.quote} />
      <Actions>
        <DepositActions />
      </Actions>
    </>
  );
});

const DepositFormInputs = memo(function DepositFormInputs() {
  const { t } = useTranslation();
  const selection = useAppSelector(selectTransactSelected);
  const multipleInputs = selection.tokens.length > 1;
  const hasOptions = useAppSelector(selectTransactNumTokens) > 1;
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const availableLabel = t('Transact-Available');
  const firstSelectLabel = useMemo(() => {
    return t(
      hasOptions
        ? forceSelection
          ? 'Transact-SelectToken'
          : 'Transact-SelectAmount'
        : 'Transact-Deposit'
    );
  }, [forceSelection, hasOptions, t]);

  if (forceSelection) {
    return (
      <DepositFormInput
        index={0}
        token={selection.tokens[0]}
        availableLabel={availableLabel}
        selectLabel={t('Transact-SelectToken')}
        showZapIcon={hasOptions}
      />
    );
  }

  return selection.tokens.map((token, index) => (
    <DepositFormInput
      key={index}
      index={index}
      token={token}
      availableLabel={availableLabel}
      selectLabel={!multipleInputs && index === 0 ? firstSelectLabel : token.symbol}
      showZapIcon={hasOptions && index === 0}
      tokenAvailable={
        forceSelection ? (
          <TokenAmount amount={BIG_ZERO} decimals={18} />
        ) : (
          <TokenInWallet token={token} index={index} />
        )
      }
    />
  ));
});

type DepositFormInputProps = {
  token: TokenEntity;
  index: number;
  selectLabel: string;
  availableLabel: string;
  showZapIcon: boolean;
  tokenAvailable?: ReactNode;
};

const DepositFormInput = memo(function DepositFormInput({
  index,
  token,
  selectLabel,
  availableLabel,
  showZapIcon,
  tokenAvailable,
}: DepositFormInputProps) {
  const classes = useStyles();

  return (
    <div>
      <div className={classes.labels}>
        <div className={classes.selectLabel}>
          {showZapIcon ? (
            <img src={zapIcon} alt="Zap" height={12} className={classes.zapIcon} />
          ) : null}
          {selectLabel}
        </div>
        {tokenAvailable ? (
          <div className={classes.availableLabel}>
            {availableLabel} <span className={classes.availableLabelAmount}>{tokenAvailable}</span>
          </div>
        ) : null}
      </div>
      <div className={classes.amount}>
        <DepositTokenAmountInput token={token} index={index} />
      </div>
    </div>
  );
});

const Container = styled('div', {
  base: {
    padding: '16px',
    sm: {
      padding: '24px',
    },
  },
});

const BoostPromotionContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textStyle: 'body.medium',
    padding: '6px 16px 8px 16px',
    color: 'text.black',
    gap: '2px',
    flexWrap: 'wrap',
    background: 'background.content.boost',
    borderRadius: '0px 0px 12px 12px',
    sm: {
      padding: '6px 24px 8px 24px',
    },
  },
});

const BoostPromotionButton = styled('button', {
  base: {
    display: 'block',
    whiteSpace: 'wrap',
    width: '100%',
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default DepositFormLoader;
