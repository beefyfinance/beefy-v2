import React, { memo, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import {
  type CLMTimelineAnalyticsEntity,
  isVaultTimelineAnalyticsEntity,
  type VaultTimelineAnalyticsEntity,
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

const useStyles = makeStyles(styles);

type TransactionProps = {
  data: VaultTimelineAnalyticsEntity | CLMTimelineAnalyticsEntity;
  tokenDecimals: number;
};

type TransactionStatProps<
  T extends VaultTimelineAnalyticsEntity | CLMTimelineAnalyticsEntity =
    | VaultTimelineAnalyticsEntity
    | CLMTimelineAnalyticsEntity
> = {
  data: T;
  mobile?: boolean;
  tokenDecimals: number;
};

const StandardAmountStat = memo<TransactionStatProps<VaultTimelineAnalyticsEntity>>(
  function StandardAmountStat({ data, tokenDecimals, mobile }) {
    const classes = useStyles();
    const { underlyingDiff } = data;

    return (
      <TokenAmount
        className={clsx(
          underlyingDiff.gt(BIG_ZERO) ? classes.textGreen : classes.textRed,
          mobile ? classes.statMobile : classes.stat
        )}
        amount={underlyingDiff}
        decimals={tokenDecimals}
      />
    );
  }
);

const CowcentratedAmountStat = memo<TransactionStatProps<CLMTimelineAnalyticsEntity>>(
  function CowcentratedAmountStat({ data, mobile }) {
    const classes = useStyles();
    const { underlying0Diff, underlying1Diff } = data;

    return (
      <>
        <TokenAmount
          className={clsx(
            underlying0Diff.gt(BIG_ZERO) ? classes.textGreen : classes.textRed,
            mobile ? classes.statMobile : classes.stat
          )}
          amount={underlying0Diff}
          decimals={18}
        />
        {'/'}
        <TokenAmount
          className={clsx(
            underlying1Diff.gt(BIG_ZERO) ? classes.textGreen : classes.textRed,
            mobile ? classes.statMobile : classes.stat
          )}
          amount={underlying1Diff}
          decimals={18}
        />
      </>
    );
  }
);

const StandardBalanceStat = memo<TransactionStatProps<VaultTimelineAnalyticsEntity>>(
  function StandardBalanceStat({ data, tokenDecimals, mobile }) {
    const classes = useStyles();
    const { shareBalance, shareToUnderlyingPrice } = data;

    return (
      <TokenAmount
        amount={shareBalance.times(shareToUnderlyingPrice)}
        decimals={tokenDecimals}
        className={mobile ? classes.statMobile : classes.stat}
      />
    );
  }
);

const CowcentratedBalanceStat = memo<TransactionStatProps<CLMTimelineAnalyticsEntity>>(
  function CowcentratedBalanceStat({ data, mobile }) {
    const classes = useStyles();
    const { underlying0Balance, underlying1Balance } = data;

    return (
      <>
        <TokenAmount
          amount={underlying0Balance}
          decimals={18}
          className={mobile ? classes.statMobile : classes.stat}
        />
        {'/'}
        <TokenAmount
          amount={underlying1Balance}
          decimals={18}
          className={mobile ? classes.statMobile : classes.stat}
        />
      </>
    );
  }
);

export const Transaction = memo<TransactionProps>(function Transaction({ data, tokenDecimals }) {
  const classes = useStyles();
  const isStandard = isVaultTimelineAnalyticsEntity(data);
  const chainId = isStandard ? data.source?.chain || data.chain : data.chain;
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const { datetime, shareBalance, usdBalance, transactionHash } = data;

  return (
    <Row>
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
          {isStandard ? (
            <StandardAmountStat data={data} tokenDecimals={tokenDecimals} />
          ) : (
            <CowcentratedAmountStat data={data} tokenDecimals={tokenDecimals} />
          )}
        </div>
        {/*Balance */}
        <div className={classes.column}>
          {isStandard ? (
            <StandardBalanceStat data={data} tokenDecimals={tokenDecimals} />
          ) : (
            <CowcentratedBalanceStat data={data} tokenDecimals={tokenDecimals} />
          )}
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

export const TransactionMobile = memo<TransactionProps>(function TransactionMobile({
  data,
  tokenDecimals,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const isStandard = isVaultTimelineAnalyticsEntity(data);
  const chainId = isStandard ? data.source?.chain || data.chain : data.chain;
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const { datetime, shareBalance, usdBalance, transactionHash } = data;

  const mooTokenBal = useMemo(() => {
    return formatTokenDisplayCondensed(shareBalance, 18);
  }, [shareBalance]);

  return (
    <RowMobile className={classes.gridMobile}>
      <VaultNetwork className={classes.vaultNetwork} chainId={chainId} />
      <InfoGrid>
        {isStandard ? (
          <StandardAmountStat data={data} tokenDecimals={tokenDecimals} mobile />
        ) : (
          <CowcentratedAmountStat data={data} tokenDecimals={tokenDecimals} mobile />
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
              <StandardBalanceStat data={data} tokenDecimals={tokenDecimals} mobile />
            ) : (
              <CowcentratedBalanceStat data={data} tokenDecimals={tokenDecimals} mobile />
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
