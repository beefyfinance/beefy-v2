import { memo, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import {
  isTimelineEntryStandard,
  type TimelineEntryCowcentratedPool,
  type TimelineEntryStandard,
} from '../../../../../../../data/entities/analytics';
import clsx from 'clsx';
import { formatISO9075 } from 'date-fns';
import {
  formatLargeUsd,
  formatTokenDisplayCondensed,
} from '../../../../../../../../helpers/format';
import { BIG_ZERO } from '../../../../../../../../helpers/big-number';
import { Row, RowMobile } from '../../../Row/Row';
import { InfoGrid } from '../InfoGrid';
import { TokenAmount } from '../../../../../../../../components/TokenAmount';
import { MobileStat } from '../../../MobileStat';
import { useTranslation } from 'react-i18next';
import { explorerTxUrl } from '../../../../../../../../helpers/url';
import { selectChainById } from '../../../../../../../data/selectors/chains';
import { useAppSelector } from '../../../../../../../../store';
import { getNetworkSrc } from '../../../../../../../../helpers/networkSrc';
import { VaultNetwork } from '../../../../../../../../components/VaultIdentity';
import {
  selectCowcentratedLikeVaultDepositTokens,
  selectDepositTokenByVaultId,
} from '../../../../../../../data/selectors/tokens';
import { TokenImage } from '../../../../../../../../components/TokenImage/TokenImage';
import type { TokenEntity } from '../../../../../../../data/entities/token';
import { type BigNumber } from 'bignumber.js';

const useStyles = makeStyles(styles);

type TransactionProps = {
  tx: TimelineEntryStandard | TimelineEntryCowcentratedPool;
};

type TransactionStatProps<
  T extends TimelineEntryStandard | TimelineEntryCowcentratedPool =
    | TimelineEntryStandard
    | TimelineEntryCowcentratedPool
> = {
  tx: T;
  mobile?: boolean;
};

const StandardAmountStat = memo<TransactionStatProps<TimelineEntryStandard>>(
  function StandardAmountStat({ tx, mobile }) {
    const classes = useStyles();
    const { underlyingDiff } = tx;
    const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, tx.vaultId));

    return (
      <TokenAmount
        className={clsx(
          underlyingDiff.gt(BIG_ZERO) ? classes.textGreen : classes.textRed,
          mobile ? classes.statMobile : classes.stat
        )}
        amount={underlyingDiff}
        decimals={depositToken.decimals}
      />
    );
  }
);

const CowcentratedAmountStat = memo<TransactionStatProps<TimelineEntryCowcentratedPool>>(
  function CowcentratedAmountStat({ tx, mobile }) {
    const classes = useStyles();
    const { underlying0Diff, underlying1Diff } = tx;
    const [token0, token1] = useAppSelector(state =>
      selectCowcentratedLikeVaultDepositTokens(state, tx.vaultId)
    );
    const variant0 = underlying0Diff.isZero()
      ? 'neutral'
      : underlying0Diff.gt(BIG_ZERO)
      ? 'positive'
      : 'negative';
    const variant1 = underlying1Diff.isZero()
      ? 'neutral'
      : underlying1Diff.gt(BIG_ZERO)
      ? 'positive'
      : 'negative';

    return (
      <div className={classes.cowcentratedTokenAmounts}>
        <TokenIconAmount
          token={token0}
          amount={underlying0Diff}
          mobile={mobile}
          variant={variant0}
        />
        <TokenIconAmount
          token={token1}
          amount={underlying1Diff}
          mobile={mobile}
          variant={variant1}
        />
      </div>
    );
  }
);

const StandardBalanceStat = memo<TransactionStatProps<TimelineEntryStandard>>(
  function StandardBalanceStat({ tx, mobile }) {
    const classes = useStyles();
    const { shareBalance, shareToUnderlyingPrice } = tx;
    const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, tx.vaultId));

    return (
      <TokenAmount
        amount={shareBalance.times(shareToUnderlyingPrice)}
        decimals={depositToken.decimals}
        className={mobile ? classes.statMobile : classes.stat}
      />
    );
  }
);

type TokenIconAmountProps = {
  token: TokenEntity;
  amount: BigNumber;
  variant?: 'neutral' | 'positive' | 'negative';
  mobile?: boolean;
};

const TokenIconAmount = memo<TokenIconAmountProps>(function IconTokenAmount({
  token,
  amount,
  mobile,
  variant = 'neutral',
}) {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.tokenIconAmount, {
        [classes.tokenIconAmountMobile]: mobile === true,
        [classes.tokenIconAmountPositive]: variant === 'positive',
        [classes.tokenIconAmountNegative]: variant === 'negative',
      })}
    >
      <TokenImage
        className={classes.tokenIcon}
        tokenAddress={token.address}
        chainId={token.chainId}
        size={16}
      />
      <TokenAmount amount={amount} decimals={18} className={classes.tokenAmount} />
    </div>
  );
});

const CowcentratedBalanceStat = memo<TransactionStatProps<TimelineEntryCowcentratedPool>>(
  function CowcentratedBalanceStat({ tx, mobile }) {
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
  }
);

export const Transaction = memo<TransactionProps>(function Transaction({ tx }) {
  const classes = useStyles();
  const isStandard = isTimelineEntryStandard(tx);
  const chainId = isStandard ? tx.source?.chain || tx.chain : tx.chain;
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const { datetime, shareBalance, usdBalance, transactionHash } = tx;

  return (
    <Row
      className={clsx({
        [classes.txCurrent]: tx.timeline === 'current',
        [classes.txPast]: tx.timeline === 'past',
      })}
    >
      {/* Date */}
      <div className={clsx(classes.stat, classes.textFlexStart)}>
        <img
          src={getNetworkSrc(chain.id)}
          alt={chain.name}
          width={24}
          height={24}
          className={classes.network}
        />
        {transactionHash ? (
          <a
            href={explorerTxUrl(chain, transactionHash)}
            target={'_blank'}
            rel={'noopener'}
            className={classes.link}
          >
            {formatISO9075(datetime)}
          </a>
        ) : (
          formatISO9075(datetime)
        )}
      </div>
      <InfoGrid>
        {/*Amount */}
        <div className={classes.column}>
          {isStandard ? <StandardAmountStat tx={tx} /> : <CowcentratedAmountStat tx={tx} />}
        </div>
        {/*Balance */}
        <div className={classes.column}>
          {isStandard ? <StandardBalanceStat tx={tx} /> : <CowcentratedBalanceStat tx={tx} />}
        </div>
        {/*MooTokenBal */}
        <div className={classes.column}>
          <TokenAmount amount={shareBalance} decimals={18} className={classes.stat} />
        </div>
        {/*Usd Balance */}
        <div className={classes.column}>
          <div className={classes.stat}>{formatLargeUsd(usdBalance || BIG_ZERO)}</div>
        </div>
      </InfoGrid>
    </Row>
  );
});

export const TransactionMobile = memo<TransactionProps>(function TransactionMobile({ tx }) {
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
    <RowMobile
      className={clsx(classes.gridMobile, {
        [classes.txCurrent]: tx.timeline === 'current',
        [classes.txPast]: tx.timeline === 'past',
      })}
    >
      <VaultNetwork className={classes.vaultNetwork} chainId={chainId} />
      <InfoGrid>
        {isStandard ? (
          <StandardAmountStat tx={tx} mobile />
        ) : (
          <CowcentratedAmountStat tx={tx} mobile />
        )}
        {/* Date */}
        <div className={classes.statMobile}>
          {transactionHash ? (
            <a
              href={explorerTxUrl(chain, transactionHash)}
              target={'_blank'}
              rel={'noopener'}
              className={classes.link}
            >
              {formatISO9075(datetime, { representation: 'date' })}
            </a>
          ) : (
            formatISO9075(datetime, { representation: 'date' })
          )}
        </div>
        <div className={clsx(classes.statMobile, classes.textDark)}>
          {formatISO9075(datetime, { representation: 'time' })}
        </div>
      </InfoGrid>
      <InfoGrid>
        <MobileStat
          valueClassName={classes.textOverflow}
          label={t('Dashboard-Filter-Balance')}
          value={
            isStandard ? (
              <StandardBalanceStat tx={tx} mobile />
            ) : (
              <CowcentratedBalanceStat tx={tx} mobile />
            )
          }
        />
        <MobileStat
          valueClassName={classes.textOverflow}
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
