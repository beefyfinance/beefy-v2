import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { memo } from 'react';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { formatBigUsd } from '../../../../../../helpers/format';
import { BreakdownMode, CalculatedBreakdownData } from '../../types';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { TokenAmount } from '../../../../../../components/TokenAmount';

const useStyles = makeStyles(styles);

export type BreakdownTableProps = {
  mode: BreakdownMode;
  breakdown: CalculatedBreakdownData;
  className?: string;
};
export const BreakdownTable = memo<BreakdownTableProps>(function BreakdownTable({
  mode,
  breakdown,
  className,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { chainId, assets, token } = breakdown;
  const valueField = `${mode}Value`;
  const amountField = `${mode}Amount`;

  return (
    <div className={clsx(classes.table, className)}>
      <div className={clsx(classes.row, classes.header)}>
        <div className={classes.cell}>{t('Vault-LpBreakdown-Asset')}</div>
        <div className={classes.cell}>{t('Vault-LpBreakdown-TokenAmount')}</div>
        <div className={classes.cell}>{t('Vault-LpBreakdown-Value')}</div>
      </div>
      {assets.map(asset => (
        <div key={asset.address} className={classes.row}>
          <div className={clsx(classes.cell, classes.asset)}>
            <AssetsImage className={classes.icon} chainId={chainId} assetIds={[asset.symbol]} />{' '}
            {asset.symbol}
          </div>
          <div className={classes.cell}>
            <TokenAmount
              amount={asset[amountField]}
              decimals={asset.decimals}
              price={asset.price}
              className={classes.tokenAmount}
            />
          </div>
          <div className={classes.cell}>{formatBigUsd(asset[valueField])}</div>
        </div>
      ))}
      <div className={clsx(classes.row, classes.footer)}>
        <div className={clsx(classes.cell, classes.asset)}>
          <AssetsImage
            className={classes.icon}
            chainId={chainId}
            assetIds={assets.map(asset => asset.symbol)}
          />{' '}
          LP
        </div>
        <div className={classes.cell}>
          <TokenAmount
            amount={breakdown[amountField]}
            decimals={token.decimals}
            price={breakdown.oneValue}
            className={classes.tokenAmount}
          />
        </div>
        <div className={classes.cell}>{formatBigUsd(breakdown[valueField])}</div>
      </div>
    </div>
  );
});
