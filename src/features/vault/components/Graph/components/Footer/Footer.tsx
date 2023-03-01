import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox';
import { BasicTabs } from '../../../../../../components/Tabs/BasicTabs';
import { AverageState } from '../../Graph';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface FooterProps {
  period: number;
  handlePeriod: (period: number) => any;
  averageLines: AverageState;
  handleAverageLines: (e: boolean, average: string) => void;
}

export const Footer = memo<FooterProps>(function ({
  period,
  handlePeriod,
  averageLines,
  handleAverageLines,
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.footer}>
      <div className={classes.items}>
        <LegendItem
          checked={averageLines.simpleAverage}
          color="#59A662"
          text={t('Average')}
          handleAverageLines={handleAverageLines}
          averageLineId="simpleAverage"
        />
        <LegendItem
          checked={averageLines.movingAverage}
          color="#5C99D6"
          text={t('Moving-Average')}
          handleAverageLines={handleAverageLines}
          averageLineId="movingAverage"
        />
      </div>
      <div className={classes.tabsContainer}>
        <BasicTabs
          labels={[t('Graph-1Day'), t('Graph-1Week'), t('Graph-1Month'), t('Graph-1Year')]}
          value={period}
          onChange={newValue => handlePeriod(newValue)}
        />
      </div>
    </div>
  );
});

interface LegendItemProps {
  color: string;
  text: string;
  checked: boolean;
  handleAverageLines: (e: boolean, average: string) => void;
  averageLineId: 'movingAverage' | 'simpleAverage';
}

const LegendItem = memo<LegendItemProps>(function ({
  color,
  text,
  checked,
  handleAverageLines,
  averageLineId,
}) {
  const classes = useStyles();

  return (
    <LabelledCheckbox
      labelClass={classes.legendItem}
      checkboxClass={classes.checkbox}
      checked={checked}
      onChange={e => handleAverageLines(e, averageLineId)}
      label={
        <>
          <div className={classes.colorReference} style={{ backgroundColor: color }} />
          {text}
        </>
      }
    />
  );
});
