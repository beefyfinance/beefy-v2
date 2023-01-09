import React, { memo } from 'react';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const LoadingStep = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <LoadingIndicator text={t('Transact-Loading')} />
    </div>
  );
});
