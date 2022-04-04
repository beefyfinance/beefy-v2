import React from 'react';
import { styles } from './styles';
import { Container, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { AssetSection } from './components/AssetSection';
import BIFI from '../../images/brand-assets/SVG/BIFI.svg';
const useStyles = makeStyles(styles as any);

const ASSETS = [
  {
    id: 'Logos',
    assets: [
      {
        id: 'Primary',
        background: 'white',
        versions: [
          {
            type: 'svg',
            fileName: 'Just_Beefy_DARK',
          },
          {
            type: 'png',
            fileName: 'Just_Beefy_DARK@2x',
          },
        ],
      },
      {
        id: 'Primary - Light',
        background: '',
        versions: [
          {
            type: 'svg',
            fileName: 'Just_beefy',
          },
          {
            type: 'png',
            fileName: 'Just_Beefy_Light@2x',
          },
        ],
      },
      {
        id: 'Mono - Dark',
        background: 'white',
        versions: [
          {
            type: 'svg',
            fileName: 'just_black_beefy',
          },
          {
            type: 'png',
            fileName: 'Just_Beefy_Black@2x',
          },
        ],
      },
      {
        id: 'Mono - Light',
        background: '',
        versions: [
          {
            type: 'svg',
            fileName: 'Just_beefy_white',
          },
          {
            type: 'png',
            fileName: 'Just_Beefy_White@2x',
          },
        ],
      },
      {
        id: 'Autocompounding',
        background: 'white',
        versions: [
          {
            type: 'svg',
            fileName: 'Autocompounding',
          },
          {
            type: 'png',
            fileName: 'Autocompounding',
          },
        ],
      },
      {
        id: 'Autocompounding - White',
        background: '',
        versions: [
          {
            type: 'svg',
            fileName: 'Autocompounding_white',
          },
          {
            type: 'png',
            fileName: 'Autocompounding_white',
          },
        ],
      },
      {
        id: 'Beefy.com QR code',
        background: '',
        versions: [
          {
            type: 'svg',
            fileName: 'beefy.com_QR',
          },
          {
            type: 'png',
            fileName: 'beefy.com_QR@2x',
          },
        ],
      },
    ],
  },
  {
    id: 'Tokens',
    assets: [
      {
        id: 'BIFI',
        background: '',
        versions: [
          {
            type: 'svg',
            fileName: 'BIFI',
          },
          {
            type: 'png',
            fileName: 'BIFI',
          },
        ],
      },
      {
        id: 'beFTM',
        background: '',
        versions: [
          {
            type: 'svg',
            fileName: 'beFTM',
          },
          {
            type: 'png',
            fileName: 'beFTM',
          },
        ],
      },
      {
        id: 'binSPIRIT',
        background: '',
        versions: [
          {
            type: 'svg',
            fileName: 'binSPIRIT',
          },
          {
            type: 'png',
            fileName: 'binSPIRIT',
          },
        ],
      },
      {
        id: 'binSPIRIT LP',
        background: '',
        versions: [
          {
            type: 'svg',
            fileName: 'binSPIRIT-SPIRIT',
          },
          {
            type: 'png',
            fileName: 'binSPIRIT_lp',
          },
        ],
      },
    ],
  },
];

export const BrandAssets = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.brandAssetsContainer}>
      <div className={classes.headerBox}>
        <img className={classes.logo} alt="BeefyLogo" src={BIFI} />
        <Typography variant="h2">{t('Footer-MediaKit')}</Typography>
      </div>
      {ASSETS.map(asset => {
        return <AssetSection id={asset.id} assets={asset.assets} />;
      })}
    </Container>
  );
};

// eslint-disable-next-line no-restricted-syntax
export default BrandAssets;
