import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBigDecimals, formatBigUsd } from '../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../store';
import { VaultEntity } from '../../../../../data/entities/vault';
import { selectVaultPnl } from '../../../../../data/selectors/analytics';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface TitleProps {
  vaultId: VaultEntity['id'];
}

export const Title = memo<TitleProps>(function ({ vaultId }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();

  const vaultPnlStats = useAppSelector(state => selectVaultPnl(state, vaultId));

  const classes = useStyles();

  const items: TitleItemProps[] = useMemo(() => {
    return [
      {
        label: 'At Deposit',
        value: formatBigDecimals(vaultPnlStats.balanceAtDeposit),
        subValue: formatBigUsd(vaultPnlStats.usdBalanceAtDeposit),
        border: false,
      },
      {
        label: 'Now',
        value: formatBigDecimals(vaultPnlStats.deposit),
        subValue: formatBigUsd(vaultPnlStats.depositUsd),
      },
      {
        label: 'Yield',
        value: formatBigDecimals(vaultPnlStats.totalYield),
        subValue: formatBigUsd(vaultPnlStats.totalYieldUsd),
        valueClassName: classes.greenValue,
      },
      {
        label: 'PNL',
        value: formatBigUsd(vaultPnlStats.totalPnlUsd),
      },
    ];
  }, [
    classes.greenValue,
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
        <TitleItem
          label={item.label}
          value={item.value}
          subValue={item.subValue}
          valueClassName={item.valueClassName}
          border={item.border}
        />
      ))}
    </div>
  );
});

interface TitleItemProps {
  label: string;
  value: string;
  subValue?: string;
  valueClassName?: string;
  border?: boolean;
}

const TitleItem = memo<TitleItemProps>(function ({
  label,
  value,
  subValue,
  valueClassName,
  border = true,
}) {
  const classes = useStyles();
  return (
    <div className={classes.itemContainer}>
      {border && <div className={classes.border} />}
      <div className={classes.textContainer}>
        <div className={classes.label}>{label}</div>
        <div className={clsx(classes.value, valueClassName)}>{value}</div>
        {subValue && <div className={classes.subValue}>{subValue}</div>}
      </div>
    </div>
  );
});
