import { makeStyles } from '@material-ui/styles';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../AssetsImage';
import { BIG_ZERO } from '../../helpers/big-number';
import { formatBigUsd, formatPercent } from '../../helpers/format';
import { styles } from './styles';
import type { TypeChart } from '../PieChart/PieChart';
import { getNetworkSrc } from '../../helpers/networkSrc';
import type BigNumber from 'bignumber.js';

// TODO: fix this type
type PayloadData = {
  value?: BigNumber;
  percentage?: number;
  label?: string;
  key?: string;
  chainId: string;
  assetIds: string[];
};

interface TooltipProps {
  payload?: { payload: PayloadData }[];
  active?: boolean;
  type?: TypeChart;
  formatter?: (s: string) => string;
}

const useStyles = makeStyles(styles);

export const PieChartTooltip = memo<TooltipProps>(function PieChartTooltip({
  payload,
  type,
  active,
  formatter,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const usdValue = formatBigUsd(data.value ?? BIG_ZERO);
    const percent = formatPercent(data.percentage ?? 0);
    const title = data.label ?? data.key ?? '';
    const formmattedTitle = formatter && title ? formatter(title) : title;
    return (
      <div className={classes.container}>
        <div className={classes.titleContainer}>
          {data.key !== 'others' && (
            <>
              {type === 'chain' && (
                <img className={classes.icon} src={getNetworkSrc(data.key)} alt={title} />
              )}
              {type === 'token' && (
                <AssetsImage size={24} chainId={data.chainId} assetIds={data.assetIds} />
              )}
            </>
          )}
          <div className={classes.title}>{formmattedTitle}</div>
        </div>
        <div className={classes.infoContainer}>
          <div className={classes.valueContainer}>
            <div className={classes.label}>{t('Dashboard-Deposited')}</div>
            <div className={classes.value}>{usdValue}</div>
          </div>
          <div className={classes.valueContainer}>
            <div className={classes.label}>{t('Dashboard-Percentage')}</div>
            <div className={classes.value}>{percent}</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
});
