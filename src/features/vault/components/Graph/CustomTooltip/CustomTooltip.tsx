import { Box, makeStyles } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { formatPercent, formatUsd } from '../../../../../helpers/format';
import { CustomTooltipProps } from './CustomTooltipProps';
import { format } from 'date-fns';

const useStyles = makeStyles(styles);
export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  stat,
  averageValue,
  movingAverageDetail,
  showMovingAverage,
  showSimpleAverage,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const LABELS = [t('TVL'), t('Graph-PriceTkn'), t('APY')];

  if (active && payload && payload.length) {
    const formattedDate = format(new Date(payload[0].payload.ts), 'MMM d, yyyy h:mm a');
    const formattedValue =
      stat === 2 ? formatPercent(payload[0].value) : formatUsd(payload[0].value);
    const formattedAverageValue = showSimpleAverage
      ? stat === 2
        ? formatPercent(averageValue)
        : formatUsd(averageValue)
      : null;

    const formattedMoveAverageValue = showMovingAverage
      ? stat === 2
        ? formatPercent(payload[1].value)
        : formatUsd(payload[1].value)
      : null;

    return (
      <div className={classes.container}>
        <p>{formattedDate}</p>
        <Box className={classes.itemContainer}>
          <p className="label">{`${LABELS[stat]}:`}</p>
          <p className={classes.value}>{formattedValue} </p>
        </Box>
        {showSimpleAverage && (
          <Box className={classes.itemContainer}>
            <p className="label">{`Average:`}</p>
            <p className={classes.value}>{formattedAverageValue}</p>
          </Box>
        )}
        {showMovingAverage && (
          <Box className={classes.itemContainer}>
            <Box>
              <p className="label">{`Moving Average:`}</p>
              <p className={classes.maDetail}>{movingAverageDetail}</p>
            </Box>
            <p className={classes.value}>{formattedMoveAverageValue}</p>
          </Box>
        )}
      </div>
    );
  }

  return null;
};
