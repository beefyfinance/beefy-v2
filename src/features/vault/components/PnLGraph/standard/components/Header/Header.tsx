import { makeStyles } from '@material-ui/core';
import { HelpOutline } from '@material-ui/icons';
import type BigNumber from 'bignumber.js';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../../components/Tooltip/BasicTooltipContent';
import {
  formatLargeUsd,
  formatTokenDisplayCondensed,
  formatTokenDisplay,
  formatLargePercent,
} from '../../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../../store';
import type { VaultEntity } from '../../../../../../data/entities/vault';
import { selectStandardGovPnl } from '../../../../../../data/selectors/analytics';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface HeaderProps {
  vaultId: VaultEntity['id'];
}

export const Header = memo<HeaderProps>(function Header({ vaultId }) {
  const { t } = useTranslation();

  const {
    usdBalanceAtDeposit,
    balanceAtDeposit,
    oraclePriceAtDeposit,
    depositUsd,
    deposit,
    oraclePrice,
    tokenDecimals,
    totalYieldUsd,
    totalYield,
    yieldPercentage,
    totalPnlUsd,
    pnlPercentage,
  } = useAppSelector(state => selectStandardGovPnl(state, vaultId));

  const classes = useStyles();

  return (
    <div className={classes.header}>
      <HeaderItem
        tooltipText={t('pnl-graph-tooltip-deposit')}
        label={t('At Deposit')}
        border={false}
      >
        <SharesValue
          amount={balanceAtDeposit}
          price={oraclePriceAtDeposit}
          decimals={tokenDecimals}
          subValue={formatLargeUsd(usdBalanceAtDeposit)}
          minShortPlaces={4}
        />
      </HeaderItem>
      <HeaderItem tooltipText={t('pnl-graph-tooltip-now-vault')} label={t('Now')}>
        <SharesValue
          amount={deposit}
          price={oraclePrice}
          decimals={tokenDecimals}
          subValue={formatLargeUsd(depositUsd)}
          minShortPlaces={4}
        />
      </HeaderItem>
      <HeaderItem tooltipText={t('pnl-graph-tooltip-yield')} label={t('Yield')}>
        <SharesValue
          amount={totalYield}
          price={oraclePrice}
          decimals={tokenDecimals}
          className={classes.greenValue}
          percentage={yieldPercentage}
          subValue={formatLargeUsd(totalYieldUsd)}
          minShortPlaces={4}
        />
      </HeaderItem>
      <HeaderItem tooltipText={t('pnl-graph-tooltip-pnl')} label={t('PNL')}>
        <UsdValue value={totalPnlUsd} percentage={pnlPercentage} />
      </HeaderItem>
    </div>
  );
});

interface HeaderItemProps {
  label: string;
  border?: boolean;
  className?: string;
  children: ReactNode;
  tooltipText: string;
}

const HeaderItem = memo<HeaderItemProps>(function HeaderItem({
  label,

  className,
  tooltipText,
  children,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.itemContainer, className)}>
      <div className={classes.textContainer}>
        <div className={classes.labelContainer}>
          <div className={classes.label}>{label}</div>
          <Tooltip triggerClass={classes.center} content={tooltipText}>
            <HelpOutline />
          </Tooltip>
        </div>
        {children}
      </div>
    </div>
  );
});

interface UsdValueProps {
  value: BigNumber;
  className?: string;
  percentage?: BigNumber;
}

const UsdValue = memo<UsdValueProps>(function UsdValue({ value, className, percentage }) {
  const classes = useStyles();
  return (
    <div className={clsx(classes.value, className)}>
      <div>{formatLargeUsd(value)}</div>
      {percentage && <span>({formatLargePercent(percentage)})</span>}
    </div>
  );
});

interface SharesValueProps {
  className?: string;
  percentage?: BigNumber;
  minShortPlaces?: number;
  amount: BigNumber;
  decimals: number;
  price: BigNumber;
  subValue?: string;
}

const SharesValue = memo<SharesValueProps>(function SharesValue({
  className,
  percentage,
  amount,
  decimals,
  subValue,
}) {
  const classes = useStyles();

  const fullAmount = formatTokenDisplay(amount, decimals);
  const shortAmount = formatTokenDisplayCondensed(amount, decimals);

  return (
    <Tooltip content={<BasicTooltipContent title={fullAmount} />}>
      <div>
        <div className={clsx(classes.value, className)}>
          <div className={clsx(classes.withTooltip, classes.textOverflow)}>{shortAmount}</div>
          {percentage && <span>({formatLargePercent(percentage)})</span>}
        </div>
        {subValue && <div className={classes.subValue}>{subValue}</div>}
      </div>
    </Tooltip>
  );
});
