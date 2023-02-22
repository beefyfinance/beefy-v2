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
        valueClassName: classes.greenValue,
      },
      {
        label: t('PNL'),
        value: vaultPnlStats.totalPnlUsd,
        sharesValueComponent: false,
      },
    ];
  }, [
    classes.greenValue,
    t,
    vaultPnlStats.balanceAtDeposit,
    vaultPnlStats.deposit,
    vaultPnlStats.depositUsd,
    vaultPnlStats.totalPnlUsd,
    vaultPnlStats.totalYield,
    vaultPnlStats.totalYieldUsd,
    vaultPnlStats.usdBalanceAtDeposit,
  ]);

  return (
    <div className={classes.title}>
      {items.map(item => (
        <HeaderItem
          key={item.label}
          label={item.label}
          value={item.value}
          subValue={item.subValue}
          valueClassName={item.valueClassName}
          border={item.border}
          sharesValueComponent={item.sharesValueComponent}
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
}

const HeaderItem = memo<HeaderItemProps>(function ({
  label,
  value,
  subValue,
  valueClassName,
  border = true,
  sharesValueComponent = true,
}) {
  const classes = useStyles();

  if (!value) {
    return <>aaaaaaa</>;
  }

  return (
    <div className={classes.itemContainer}>
      {border && <div className={classes.border} />}
      <div className={classes.textContainer}>
        <div className={classes.label}>{label}</div>
        {sharesValueComponent ? (
          <SharesValue value={value} className={valueClassName} />
        ) : (
          <UsdValue value={value} className={valueClassName} />
        )}
        {subValue && <div className={classes.subValue}>{subValue}</div>}
      </div>
    </div>
  );
});

interface ValueItemProps {
  value: BigNumber;
  className?: string;
}

const UsdValue = memo<ValueItemProps>(function ({ value, className }) {
  const classes = useStyles();
  return <div className={clsx(classes.value, className)}>{formatBigUsd(value)}</div>;
});

const SharesValue = memo<ValueItemProps>(function ({ value, className }) {
  const classes = useStyles();

  const shortAmount = formatBigDecimals(value, 4);
  const fullAmount = formatFullBigNumber(value, 18);
  return (
    <Tooltip
      triggerClass={clsx(classes.withTooltip, classes.value, className)}
      content={<BasicTooltipContent title={fullAmount} />}
    >
      {shortAmount}
    </Tooltip>
  );
});
