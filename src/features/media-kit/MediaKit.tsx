import React, { memo } from 'react';
import { styles } from './styles';
import { Container, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { AssetSection } from './components/AssetSection';
import BIFI from '../../images/brand-assets/SVG/BIFI.svg';
import { BRAND_ASSETS } from '../../config/brand-assets';
import { Meta } from '../../components/Meta/Meta';

const useStyles = makeStyles(styles);

export const MediaKit = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <>
      <Meta title={t('Meta-MediaKit-Title')} description={t('Meta-MediaKit-Description')} />
      <Container maxWidth="lg">
        <div className={classes.headerBox}>
          <img className={classes.logo} alt="BeefyLogo" src={BIFI} />
          <Typography variant="h2">{t('Footer-MediaKit')}</Typography>
        </div>
        {BRAND_ASSETS.map(asset => (
          <AssetSection key={asset.id} id={asset.id} assets={asset.assets} />
        ))}
      </Container>
    </>
  );
});
