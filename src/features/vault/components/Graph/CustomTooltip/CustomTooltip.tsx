import { makeStyles, Paper } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { styles } from './styles';
import { formatApy, formatUsd } from '../../../../../helpers/format';
import { CustomTooltipProps } from './CustomTooltipProps';

const useStyles = makeStyles(styles as any);
export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, stat }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const LABELS = [t('TVL'), t('Graph-PriceTkn'), t('APY')];

  if (active && payload && payload.length) {
    const formattedDate = moment(new Date(payload[0].payload.ts)).format('lll');
    const formattedValue = stat === 2 ? formatApy(payload[0].value) : formatUsd(payload[0].value);

    return (
      <Paper className={classes.container}>
        <p>{formattedDate}</p>
        <p className="label">{`${LABELS[stat]} : ${formattedValue}`}</p>
      </Paper>
    );
  }

  return null;
};
