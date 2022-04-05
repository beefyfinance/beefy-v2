import React from 'react';
import { styles } from './styles';
import { Container, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { AssetSection } from './components/AssetSection';
import BIFI from '../../images/brand-assets/SVG/BIFI.svg';
import { BRAND_ASSETS } from '../../config/brand-assets';

const useStyles = makeStyles(styles);

export const BrandAssets = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Container maxWidth="lg">
      <div className={classes.headerBox}>
        <img className={classes.logo} alt="BeefyLogo" src={BIFI} />
        <Typography variant="h2">{t('Footer-MediaKit')}</Typography>
      </div>
      {BRAND_ASSETS.map(asset => (
        <AssetSection key={asset.id} id={asset.id} assets={asset.assets} />
      ))}
    </Container>
  );
};

// eslint-disable-next-line no-restricted-syntax
export default BrandAssets;
