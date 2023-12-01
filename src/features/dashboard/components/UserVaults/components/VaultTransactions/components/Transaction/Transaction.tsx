import React, { memo, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import type { VaultTimelineAnalyticsEntity } from '../../../../../../../data/entities/analytics';
import clsx from 'clsx';
import { formatISO9075 } from 'date-fns';
import { formatBigUsd, formatSignificantBigNumber } from '../../../../../../../../helpers/format';
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

interface TransactionProps {
  data: VaultTimelineAnalyticsEntity;
  tokenDecimals: number;
}
export const Transaction = memo<TransactionProps>(function Transaction({ data, tokenDecimals }) {
  const classes = useStyles();
  const chainId = data.source?.chain || data.chain;
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const {
    datetime,
    shareBalance,
    usdBalance,
    underlyingDiff,
    shareToUnderlyingPrice,
    underlyingToUsdPrice,
    transactionHash,
  } = data;

  const amountClassName = useMemo(() => {
    return underlyingDiff.gt(BIG_ZERO) ? classes.textGreen : classes.textRed;
  }, [classes.textGreen, classes.textRed, underlyingDiff]);

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
        <a
          href={explorerTxUrl(chain, transactionHash)}
          target={'_blank'}
          rel={'noopener'}
          className={classes.link}
        >
          {formatISO9075(datetime)}
        </a>
      </div>
      <InfoGrid>
        {/*Amount */}
        <div className={classes.column}>
          <TokenAmount
            className={clsx(amountClassName, classes.stat)}
            amount={underlyingDiff}
            decimals={tokenDecimals}
            price={underlyingToUsdPrice}
          />
        </div>
        <div className={classes.column}>
          {/*Balance */}
          <TokenAmount
            amount={shareBalance.times(shareToUnderlyingPrice)}
            decimals={tokenDecimals}
            price={underlyingToUsdPrice}
            className={classes.stat}
          />
        </div>
        {/*MooTokenBal */}
        <div className={classes.column}>
          <TokenAmount
            amount={shareBalance}
            decimals={18}
            price={shareToUnderlyingPrice}
            className={classes.stat}
          />
        </div>
        {/*Usd Balance */}
        <div className={classes.column}>
          <div className={classes.stat}>{formatBigUsd(usdBalance)}</div>
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
  const chainId = data.source?.chain || data.chain;
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const {
    datetime,
    shareBalance,
    usdBalance,
    underlyingDiff,
    shareToUnderlyingPrice,
    underlyingToUsdPrice,
    underlyingBalance,
    transactionHash,
  } = data;

  const amountClassName = useMemo(() => {
    return underlyingDiff.gt(BIG_ZERO) ? classes.textGreen : classes.textRed;
  }, [classes.textGreen, classes.textRed, underlyingDiff]);

  const balance = useMemo(() => {
    return formatSignificantBigNumber(underlyingBalance, tokenDecimals, underlyingToUsdPrice, 0, 2);
  }, [underlyingBalance, tokenDecimals, underlyingToUsdPrice]);

  const mooTokenBal = useMemo(() => {
    return formatSignificantBigNumber(shareBalance, 18, shareToUnderlyingPrice, 0, 2);
  }, [shareBalance, shareToUnderlyingPrice]);

  const diff = useMemo(() => {
    return formatSignificantBigNumber(underlyingDiff, tokenDecimals, underlyingToUsdPrice, 0, 2);
  }, [underlyingDiff, tokenDecimals, underlyingToUsdPrice]);

  return (
    <RowMobile className={classes.gridMobile}>
      <VaultNetwork className={classes.vaultNetwork} chainId={chainId} />
      <InfoGrid>
        <div className={clsx(amountClassName, classes.statMobile)}>{`${
          underlyingDiff.gt(BIG_ZERO) ? ' +' : ''
        } ${diff}`}</div>
        {/* Date */}
        <div className={classes.statMobile}>
          <a
            href={explorerTxUrl(chain, transactionHash)}
            target={'_blank'}
            rel={'noopener'}
            className={classes.link}
          >
            {formatISO9075(datetime, { representation: 'date' })}
          </a>
        </div>
        <div className={clsx(classes.statMobile, classes.textDark)}>
          {formatISO9075(datetime, { representation: 'time' })}
        </div>
      </InfoGrid>
      <InfoGrid>
        <MobileStat
          valueClassName={classes.textOverflow}
          label={t('Dashboard-Filter-Balance')}
          value={balance}
        />
        <MobileStat
          valueClassName={classes.textOverflow}
          label={t('Dashboard-Filter-MooTokens')}
          value={mooTokenBal}
        />
        <MobileStat label={t('Dashboard-Filter-UsdBalance')} value={formatBigUsd(usdBalance)} />
      </InfoGrid>
    </RowMobile>
  );
});
