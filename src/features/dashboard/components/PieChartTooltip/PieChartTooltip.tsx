import { makeStyles } from '@material-ui/styles';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../components/AssetsImage';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { formatPercent, formatUsd } from '../../../../helpers/format';
import { styles } from './styles';

interface TooltipProps {
  active?: any;
  payload?: any;
  type: 'chain' | 'platform' | 'token';
}

const useStyles = makeStyles(styles);

export const PieChartTooltip = memo<TooltipProps>(function ({ active, payload, type }) {
  const classes = useStyles();
  const { t } = useTranslation();

  if (payload) {
    const data = payload[0]?.payload;
    const usdValue = formatUsd(data?.value ?? BIG_ZERO);
    const percent = formatPercent(data?.percentage ?? 0);
    const title = data?.key ?? '';
    return (
      <div className={classes.container}>
        <div className={classes.titleContainer}>
          {type === 'chain' && data?.key && (
            <img
              className={classes.icon}
              src={require(`../../../../images/networks/${data.key}.svg`).default}
              alt={title}
            />
          )}
          {type === 'token' && data?.key && (
            <AssetsImage size={24} chainId={'bsc'} assetIds={[data.key]} />
          )}
          <div className={classes.title}>{title}</div>
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
