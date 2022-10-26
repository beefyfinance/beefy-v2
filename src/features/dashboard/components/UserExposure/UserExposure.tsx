import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainExposure } from '../ChainExposure';
import { PlatformExposure } from '../PlatformExposure ';
import { Section } from '../Section';
import { StablesExposure } from '../StablesExposure';
import { TokenExposure } from '../TokenExposure';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const UserExposure = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Section title={t('Overview')}>
      <div className={classes.pieChartsContainer}>
        <ChainExposure />
        <PlatformExposure />
        <TokenExposure />
      </div>
      <StablesExposure />
    </Section>
  );
});
