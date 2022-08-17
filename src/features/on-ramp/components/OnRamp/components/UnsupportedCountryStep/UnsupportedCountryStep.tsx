import React, { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Step } from '../Step';
import { useTranslation } from 'react-i18next';
import { ReportProblemOutlined } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export const UnsupportedCountryStep = memo(function () {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Step title={null} contentClass={classes.container}>
      <div className={classes.circle}>
        <ReportProblemOutlined className={classes.icon} />
      </div>
      <div className={classes.title}>{t('OnRamp-UnsupportedCountryStep-Title')}</div>
      <div className={classes.content}>{t('OnRamp-UnsupportedCountryStep-Content')}</div>
    </Step>
  );
});
