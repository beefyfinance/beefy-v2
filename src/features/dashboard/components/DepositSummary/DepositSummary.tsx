import { Container, makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryStats } from '../SummaryStats';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const DepositSummary = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Container maxWidth="lg">
        <div className={classes.title}>{t('Dashboard-Title')}</div>
        <SummaryStats />
      </Container>
    </div>
  );
});
