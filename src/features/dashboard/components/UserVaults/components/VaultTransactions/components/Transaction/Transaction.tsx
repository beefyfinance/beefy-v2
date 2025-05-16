import { css } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import { formatISO9075 } from 'date-fns';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TokenAmount } from '../../../../../../../../components/TokenAmount/TokenAmount.tsx';
import { TokenImage } from '../../../../../../../../components/TokenImage/TokenImage.tsx';
import { VaultNetwork } from '../../../../../../../../components/VaultIdentity/VaultIdentity.tsx';
import { BIG_ZERO } from '../../../../../../../../helpers/big-number.ts';
import {
  formatLargeUsd,
  formatTokenDisplayCondensed,
} from '../../../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../../../helpers/mui.ts';
import { getNetworkSrc } from '../../../../../../../../helpers/networkSrc.ts';
import { explorerTxUrl } from '../../../../../../../../helpers/url.ts';
import { useAppSelector } from '../../../../../../../data/store/hooks.ts';
import {
  isTimelineEntryStandard,
  type TimelineEntryCowcentratedPool,
  type TimelineEntryCowcentratedVault,
  type TimelineEntryStandard,
} from '../../../../../../../data/entities/analytics.ts';
import type { TokenEntity } from '../../../../../../../data/entities/token.ts';
import { selectChainById } from '../../../../../../../data/selectors/chains.ts';
import {
  selectCowcentratedLikeVaultDepositTokens,
  selectDepositTokenByVaultId,
} from '../../../../../../../data/selectors/tokens.ts';
import { MobileStat } from '../../../MobileStat/MobileStat.tsx';
import { Row, RowMobile } from '../../../Row/Row.tsx';
import { InfoGrid } from '../InfoGrid/InfoGrid.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type TransactionProps = {
  tx: TimelineEntryStandard | TimelineEntryCowcentratedPool | TimelineEntryCowcentratedVault;
};

type TransactionStatProps<
  T extends
    | TimelineEntryStandard
    | TimelineEntryCowcentratedPool
    | TimelineEntryCowcentratedVault =
    | TimelineEntryStandard
    | TimelineEntryCowcentratedPool
    | TimelineEntryCowcentratedVault,
> = {
  tx: T;
  mobile?: boolean;
};

const StandardAmountStat = memo(function StandardAmountStat({
  tx,
  mobile,
}: TransactionStatProps<TimelineEntryStandard>) {
  const { underlyingDiff } = tx;
  const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, tx.vaultId));

  return (
    <TokenAmount
      css={css.raw(
        mobile ? styles.statMobile : styles.stat,
        underlyingDiff.gt(BIG_ZERO) ? styles.textGreen : styles.textRed
      )}
      amount={underlyingDiff}
      decimals={depositToken.decimals}
    />
  );
});

const CowcentratedAmountStat = memo(function CowcentratedAmountStat({
  tx,
  mobile,
}: TransactionStatProps<TimelineEntryCowcentratedPool | TimelineEntryCowcentratedVault>) {
  const classes = useStyles();
  const { underlying0Diff, underlying1Diff } = tx;
  const [token0, token1] = useAppSelector(state =>
    selectCowcentratedLikeVaultDepositTokens(state, tx.vaultId)
  );
  const variant0 =
    underlying0Diff.isZero() ? 'neutral'
    : underlying0Diff.gt(BIG_ZERO) ? 'positive'
    : 'negative';
  const variant1 =
    underlying1Diff.isZero() ? 'neutral'
    : underlying1Diff.gt(BIG_ZERO) ? 'positive'
    : 'negative';

  return (
    <div className={classes.cowcentratedTokenAmounts}>
      <TokenIconAmount token={token0} amount={underlying0Diff} mobile={mobile} variant={variant0} />
      <TokenIconAmount token={token1} amount={underlying1Diff} mobile={mobile} variant={variant1} />
    </div>
  );
});

const StandardBalanceStat = memo(function StandardBalanceStat({
  tx,
  mobile,
}: TransactionStatProps<TimelineEntryStandard>) {
  const { shareBalance, shareToUnderlyingPrice } = tx;
  const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, tx.vaultId));

  return (
    <TokenAmount
      amount={shareBalance.times(shareToUnderlyingPrice)}
      decimals={depositToken.decimals}
      css={mobile ? styles.statMobile : styles.stat}
    />
  );
});

type TokenIconAmountProps = {
  token: TokenEntity;
  amount: BigNumber;
  variant?: 'neutral' | 'positive' | 'negative';
  mobile?: boolean;
};

const TokenIconAmount = memo(function IconTokenAmount({
  token,
  amount,
  mobile,
  variant = 'neutral',
}: TokenIconAmountProps) {
  return (
    <div
      className={css(
        styles.tokenIconAmount,
        mobile === true && styles.tokenIconAmountMobile,
        variant === 'positive' && styles.tokenIconAmountPositive,
        variant === 'negative' && styles.tokenIconAmountNegative
      )}
    >
      <TokenImage
        css={styles.tokenIcon}
        address={token.address}
        chainId={token.chainId}
        size={16}
      />
      <TokenAmount amount={amount} decimals={18} css={styles.tokenAmount} />
    </div>
  );
});

const CowcentratedBalanceStat = memo(function CowcentratedBalanceStat({
  tx,
  mobile,
}: TransactionStatProps<TimelineEntryCowcentratedPool | TimelineEntryCowcentratedVault>) {
  const classes = useStyles();
  const { underlying0Balance, underlying1Balance } = tx;
  const [token0, token1] = useAppSelector(state =>
    selectCowcentratedLikeVaultDepositTokens(state, tx.vaultId)
  );

  return (
    <div className={classes.cowcentratedTokenAmounts}>
      <TokenIconAmount token={token0} amount={underlying0Balance} mobile={mobile} />
      <TokenIconAmount token={token1} amount={underlying1Balance} mobile={mobile} />
    </div>
  );
});

export const Transaction = memo(function Transaction({ tx }: TransactionProps) {
  const classes = useStyles();
  const isStandard = isTimelineEntryStandard(tx);
  const chainId = isStandard ? tx.source?.chain || tx.chain : tx.chain;
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const { datetime, shareBalance, usdBalance, transactionHash } = tx;

  return (
    <Row css={css.raw(tx.timeline === 'past' && styles.txPast)}>
      {/* Date */}
      <div className={css(styles.stat, styles.textFlexStart)}>
        <img
          src={getNetworkSrc(chain.id)}
          alt={chain.name}
          width={24}
          height={24}
          className={classes.network}
        />
        {transactionHash ?
          <a
            href={explorerTxUrl(chain, transactionHash)}
            target={'_blank'}
            rel={'noopener'}
            className={classes.link}
          >
            {formatISO9075(datetime)}
          </a>
        : formatISO9075(datetime)}
      </div>
      <InfoGrid>
        {/*Amount */}
        <div className={classes.column}>
          {isStandard ?
            <StandardAmountStat tx={tx} />
          : <CowcentratedAmountStat tx={tx} />}
        </div>
        {/*Balance */}
        <div className={classes.column}>
          {isStandard ?
            <StandardBalanceStat tx={tx} />
          : <CowcentratedBalanceStat tx={tx} />}
        </div>
        {/*MooTokenBal */}
        <div className={classes.column}>
          <TokenAmount amount={shareBalance} decimals={18} css={styles.stat} />
        </div>
        {/*Usd Balance */}
        <div className={classes.column}>
          <div className={classes.stat}>{formatLargeUsd(usdBalance || BIG_ZERO)}</div>
        </div>
      </InfoGrid>
    </Row>
  );
});

export const TransactionMobile = memo(function TransactionMobile({ tx }: TransactionProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const isStandard = isTimelineEntryStandard(tx);
  const chainId = isStandard ? tx.source?.chain || tx.chain : tx.chain;
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const { datetime, shareBalance, usdBalance, transactionHash } = tx;

  const mooTokenBal = useMemo(() => {
    return formatTokenDisplayCondensed(shareBalance, 18);
  }, [shareBalance]);

  return (
    <RowMobile css={css.raw(styles.gridMobile, tx.timeline === 'past' && styles.txPast)}>
      <VaultNetwork css={styles.vaultNetwork} chainId={chainId} />
      <InfoGrid>
        {isStandard ?
          <StandardAmountStat tx={tx} mobile />
        : <CowcentratedAmountStat tx={tx} mobile />}
        {/* Date */}
        <div className={classes.statMobile}>
          {transactionHash ?
            <a
              href={explorerTxUrl(chain, transactionHash)}
              target={'_blank'}
              rel={'noopener'}
              className={classes.link}
            >
              {formatISO9075(datetime, { representation: 'date' })}
            </a>
          : formatISO9075(datetime, { representation: 'date' })}
        </div>
        <div className={css(styles.statMobile, styles.textDark)}>
          {formatISO9075(datetime, { representation: 'time' })}
        </div>
      </InfoGrid>
      <InfoGrid>
        <MobileStat
          valueCss={styles.textOverflow}
          label={t('Dashboard-Filter-Balance')}
          value={
            isStandard ?
              <StandardBalanceStat tx={tx} mobile />
            : <CowcentratedBalanceStat tx={tx} mobile />
          }
        />
        <MobileStat
          valueCss={styles.textOverflow}
          label={t('Dashboard-Filter-MooTokens')}
          value={mooTokenBal}
        />
        <MobileStat
          label={t('Dashboard-Filter-UsdBalance')}
          value={formatLargeUsd(usdBalance || BIG_ZERO)}
        />
      </InfoGrid>
    </RowMobile>
  );
});
