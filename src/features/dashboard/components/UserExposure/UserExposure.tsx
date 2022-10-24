import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store';
import { selectUserExposureByKey, selectUserTokenExposure } from '../../../data/selectors/balance';
import { ExposureChart } from '../ExposureChart';
import { Section } from '../Section';
import { StablesExposure } from '../StablesExposure';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const UserExposure = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  const platformExposureData = useAppSelector(state =>
    selectUserExposureByKey(state, 'platformId')
  );
  const chainExposureData = useAppSelector(state => selectUserExposureByKey(state, 'chainId'));

  const tokensExposureData = useAppSelector(selectUserTokenExposure);

  return (
    <Section title={t('Overview')}>
      <div className={classes.pieChartsContainer}>
        <ExposureChart title={t('Exposure-Chain')} type="chain" data={chainExposureData} />
        <ExposureChart title={t('Exposure-Platform')} type="platform" data={platformExposureData} />
        <ExposureChart title={t('Exposure-Tokens')} type="token" data={tokensExposureData} />
      </div>
      <StablesExposure />
    </Section>
  );
});
