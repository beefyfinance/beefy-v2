import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { memo } from 'react';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import {
  formatBigUsd,
  formatFullBigNumber,
  formatSignificantBigNumber,
} from '../../../../../../helpers/format';
import { BreakdownMode, CalculatedAsset, CalculatedBreakdownData } from '../../types';
import clsx from 'clsx';
import { BigNumber } from 'bignumber.js';
import { Tooltip } from '../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

type TokenAmountProps = {
  value: BigNumber;
  decimals: number;
  price: BigNumber;
  className?: string;
};
const TokenAmount = memo<TokenAmountProps>(function TokenAmount({
  value,
  decimals,
  price,
  className,
}) {
  const fullValue = formatFullBigNumber(value, decimals);
  const shortValue = formatSignificantBigNumber(value, decimals, price);
  const needTooltip = shortValue.length < fullValue.length;

  return needTooltip ? (
    <Tooltip triggerClass={className} content={<BasicTooltipContent title={fullValue} />}>
      {shortValue}
    </Tooltip>
  ) : (
    <span className={className}>{fullValue}</span>
  );
});

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
  const { vault, asset } = breakdown;
  const valueField = `${mode}Value`;
  const amountField = `${mode}Amount`;

  function TableRow(asset: CalculatedAsset) {
    return (
      <div key={asset.address} className={classes.row}>
        <div className={classes.data}>
          <div className={clsx(classes.cell)}>
            <AssetsImage
              className={classes.icon}
              chainId={vault.chainId}
              assetIds={asset.underlying ? asset.underlying.map(a => a.symbol) : [asset.symbol]}
            />
            <span className={classes.asset}>
              {(() => {
                if (asset.name !== null && asset.name !== undefined) {
                  if (asset.name !== asset.symbol) {
                    return `${asset.name} (${asset.symbol})`;
                  } else {
                    return asset.name;
                  }
                } else {
                  return asset.symbol;
                }
              })()}
            </span>
          </div>
          <div className={classes.cell}>
            <TokenAmount
              value={asset[amountField]}
              decimals={asset.decimals}
              price={asset.price}
              className={classes.tokenAmount}
            />
          </div>
          <div className={classes.cell}>{formatBigUsd(asset[valueField])}</div>
        </div>
        <div className={classes.underlying}>{asset.underlying?.map(TableRow)}</div>
      </div>
    );
  }

  return (
    <div className={clsx(classes.table, className)}>
      <div className={clsx(classes.row, classes.header)}>
        <div className={clsx(classes.data)}>
          <div className={classes.cell}>{t('Vault-LpBreakdown-Asset')}</div>
          <div className={classes.cell}>{t('Vault-LpBreakdown-TokenAmount')}</div>
          <div className={classes.cell}>{t('Vault-LpBreakdown-Value')}</div>
        </div>
      </div>
      {asset.underlying.map(TableRow)}
      <div className={clsx(classes.row, classes.footer)}>
        <div className={clsx(classes.data)}>
          <div className={clsx(classes.cell)}>
            <AssetsImage
              className={classes.icon}
              chainId={vault.chainId}
              assetIds={vault.assetIds}
            />
            <span className={classes.asset}>LP</span>
          </div>
          <div className={classes.cell}>
            <TokenAmount
              value={breakdown.asset[amountField]}
              decimals={asset.decimals}
              price={breakdown.asset.oneValue}
              className={classes.tokenAmount}
            />
          </div>
          <div className={classes.cell}>{formatBigUsd(breakdown.asset[valueField])}</div>
        </div>
      </div>
    </div>
  );
});
