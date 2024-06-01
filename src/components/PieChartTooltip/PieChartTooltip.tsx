import { makeStyles } from '@material-ui/styles';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../AssetsImage';
import { BIG_ZERO } from '../../helpers/big-number';
import { formatLargePercent, formatLargeUsd } from '../../helpers/format';
import { styles } from './styles';
import { getNetworkSrc } from '../../helpers/networkSrc';
import type {
  ChainExposurePayloadData,
  GenericExposurePayloadData,
  PieChartType,
  TokenExposurePayloadData,
} from '../PieChart/types';

const useStyles = makeStyles(styles);

type BaseExposureTooltipProps = {
  active?: boolean;
  formatter?: (s: string) => string;
};

type TokenExposureTooltipProps = BaseExposureTooltipProps & {
  type: 'token';
  payload?: { payload: TokenExposurePayloadData }[];
};

type ChainExposureTooltipProps = BaseExposureTooltipProps & {
  type: 'chain';
  payload?: { payload: ChainExposurePayloadData }[];
};

type GenericExposureTooltipProps = BaseExposureTooltipProps & {
  type: Exclude<PieChartType, 'token' | 'chain'>;
  payload?: { payload: GenericExposurePayloadData }[];
};

type TooltipProps =
  | TokenExposureTooltipProps
  | ChainExposureTooltipProps
  | GenericExposureTooltipProps;

type InactiveData = {
  active: false;
};

type BaseActiveData = {
  active: true;
  usdValue: string;
  percent: string;
  title: string;
  key: string;
};

type TokenData = BaseActiveData & {
  type: TokenExposureTooltipProps['type'];
  chainId: TokenExposurePayloadData['chainId'];
  symbols: TokenExposurePayloadData['symbols'];
};

type ChainData = BaseActiveData & {
  type: ChainExposureTooltipProps['type'];
  chainId: ChainExposurePayloadData['chainId'];
};

type GenericData = BaseActiveData & {
  type: GenericExposureTooltipProps['type'];
  title: GenericExposurePayloadData['label'];
};

function extractProps(props: TooltipProps): InactiveData | ChainData | TokenData | GenericData;
function extractProps(props: ChainExposureTooltipProps): InactiveData | ChainData;
function extractProps(props: TokenExposureTooltipProps): InactiveData | TokenData;
function extractProps(props: GenericExposureTooltipProps): InactiveData | GenericData;
function extractProps(props: TooltipProps): InactiveData | ChainData | TokenData | GenericData {
  if (!props.active || !props.payload || !props.payload.length || !props.payload[0].payload) {
    return { active: false };
  }

  const data = props.payload[0].payload;
  const usdValue = formatLargeUsd(data.value ?? BIG_ZERO);
  const percent = formatLargePercent(data.percentage ?? 0);
  const title = data.label ?? data.key ?? '';
  const formattedTitle = props.formatter && title ? props.formatter(title) : title;
  const base = {
    active: true as const,
    usdValue,
    percent,
    title: formattedTitle,
    key: props.payload[0].payload.key,
  };

  if (props.type === 'token') {
    return {
      ...base,
      type: props.type,
      chainId: props.payload[0].payload.chainId,
      symbols: props.payload[0].payload.symbols,
    };
  }

  if (props.type === 'chain') {
    return {
      ...base,
      type: props.type,
      key: props.payload[0].payload.key,
      chainId: props.payload[0].payload.chainId,
    };
  }

  return {
    ...base,
    type: props.type,
  };
}

export const PieChartTooltip = memo<TooltipProps>(function PieChartTooltip(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const data = useMemo(() => extractProps(props), [props]);

  if (data.active) {
    const { usdValue, percent, title } = data;
    return (
      <div className={classes.container}>
        <div className={classes.titleContainer}>
          {data.key !== 'others' ? (
            <>
              {data.type === 'chain' && data.chainId !== 'others' ? (
                <img className={classes.icon} src={getNetworkSrc(data.chainId)} alt={title} />
              ) : null}
              {data.type === 'token' ? (
                <AssetsImage size={24} chainId={data.chainId} assetSymbols={data.symbols} />
              ) : null}
            </>
          ) : null}
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
