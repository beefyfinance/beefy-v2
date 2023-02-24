import { makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';
import {
  formatBigDecimals,
  formatBigUsd,
  formatFullBigNumber,
  formatPercent,
} from '../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../store';
import { VaultEntity } from '../../../../../data/entities/vault';
import { selectVaultPnl } from '../../../../../data/selectors/analytics';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface HeaderProps {
  vaultId: VaultEntity['id'];
}

export const Header = memo<HeaderProps>(function ({ vaultId }) {
  const { t } = useTranslation();

  const vaultPnlStats = useAppSelector(state => selectVaultPnl(state, vaultId));

  const classes = useStyles();

  const items: HeaderItemProps[] = useMemo(() => {
    return [
      {
        label: t('At Deposit'),
        value: vaultPnlStats.balanceAtDeposit,
        subValue: formatBigUsd(vaultPnlStats.usdBalanceAtDeposit),
        border: false,
      },
      {
        label: t('Now'),
        value: vaultPnlStats.deposit,
        subValue: formatBigUsd(vaultPnlStats.depositUsd),
      },
      {
        label: t('Yield'),
        value: vaultPnlStats.totalYield,
        subValue: formatBigUsd(vaultPnlStats.totalYieldUsd),
        percentage: formatPercent(vaultPnlStats.yieldPercentage),
        valueClassName: classes.greenValue,
      },
      {
        label: t('PNL'),
        value: vaultPnlStats.totalPnlUsd,
        percentage: formatPercent(vaultPnlStats.pnlPercentage),
        sharesValueComponent: false,
      },
    ];
  }, [
    classes.greenValue,
    t,
    vaultPnlStats.balanceAtDeposit,
    vaultPnlStats.deposit,
    vaultPnlStats.depositUsd,
    vaultPnlStats.pnlPercentage,
    vaultPnlStats.totalPnlUsd,
    vaultPnlStats.totalYield,
    vaultPnlStats.totalYieldUsd,
    vaultPnlStats.usdBalanceAtDeposit,
    vaultPnlStats.yieldPercentage,
  ]);

  return (
    <div className={classes.header}>
      {items.map(item => (
        <HeaderItem
          key={item.label}
          label={item.label}
          value={item.value}
          subValue={item.subValue}
          valueClassName={item.valueClassName}
          border={item.border}
          sharesValueComponent={item.sharesValueComponent}
          percentage={item.percentage}
        />
      ))}
    </div>
  );
});

interface HeaderItemProps {
  label: string;
  value: BigNumber;
  subValue?: string;
  valueClassName?: string;
  border?: boolean;
  sharesValueComponent?: boolean;
  percentage?: string;
}

const HeaderItem = memo<HeaderItemProps>(function ({
  label,
  value,
  subValue,
  valueClassName,
  border = true,
  sharesValueComponent = true,
  percentage,
}) {
  const classes = useStyles();

  return (
    <div className={classes.itemContainer}>
      {border && <div className={classes.border} />}
      <div className={classes.textContainer}>
        <div className={classes.label}>{label}</div>
        {sharesValueComponent ? (
          <SharesValue value={value} percentage={percentage} className={valueClassName} />
        ) : (
          <UsdValue value={value} percentage={percentage} className={valueClassName} />
        )}
        {subValue && <div className={classes.subValue}>{subValue}</div>}
      </div>
    </div>
  );
});

interface ValueItemProps {
  value: BigNumber;
  className?: string;
  percentage?: string;
}

const UsdValue = memo<ValueItemProps>(function ({ value, className, percentage }) {
  const classes = useStyles();
  return (
    <div className={clsx(classes.value, className)}>
      <div>{formatBigUsd(value)}</div>
      {percentage && <span>({percentage})</span>}
    </div>
  );
});

const SharesValue = memo<ValueItemProps>(function ({ value, className, percentage }) {
  const classes = useStyles();

  const shortAmount = formatBigDecimals(value, 4);
  const fullAmount = formatFullBigNumber(value, 18);
  return (
    <Tooltip
      triggerClass={clsx(classes.value, className)}
      content={<BasicTooltipContent title={fullAmount} />}
    >
      <div className={classes.withTooltip}>{shortAmount}</div>
      {percentage && <span>({percentage})</span>}
    </Tooltip>
  );
});
