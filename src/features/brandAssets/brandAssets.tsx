import React from 'react';
import { MediaCard } from './components/MediaCard';
import { styles } from './styles';
import { Container, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles as any);

function getImage(imageName, fileType) {
  return require(`../../images/brand-assets/${fileType.toUpperCase()}/${imageName}.${fileType.toLowerCase()}`)
    .default;
}

const LOGOS = [
  {
    svgImage: getImage('Just_Beefy_DARK', 'svg'),
    pngImage: getImage('Just_Beefy_DARK@2x', 'png'),
    description: 'Primary',
    imageBGColor: 'white',
  },
  {
    svgImage: getImage('Just_beefy', 'svg'),
    pngImage: getImage('Just_Beefy_Light@2x', 'png'),
    description: 'Primary - Light',
    imageBGColor: '',
  },
  {
    svgImage: getImage('just_black_beefy', 'svg'),
    pngImage: getImage('Just_Beefy_Black@2x', 'png'),
    description: 'Mono - Dark',
    imageBGColor: 'white',
  },
  {
    svgImage: getImage('Just_beefy_white', 'svg'),
    pngImage: getImage('Just_Beefy_White@2x', 'png'),
    description: 'Mono - Light',
    imageBGColor: '',
  },
  {
    svgImage: getImage('Autocompounding', 'svg'),
    pngImage: getImage('Autocompounding', 'png'),
    description: 'Autocompounding',
    imageBGColor: 'white',
  },
  {
    svgImage: getImage('Autocompounding_white', 'svg'),
    pngImage: getImage('Autocompounding_white', 'png'),
    description: 'Autocompounding - White',
    imageBGColor: '',
  },
  {
    svgImage: getImage('beefy.com_QR', 'svg'),
    pngImage: getImage('beefy.com_QR@2x', 'png'),
    description: 'Beefy.com QR code',
    imageBGColor: '',
  },
];
const TOKENS = [
  {
    svgImage: getImage('BIFI', 'svg'),
    pngImage: getImage('BIFI', 'png'),
    description: 'Beefy',
    imageBGColor: '',
  },
  {
    svgImage: getImage('beFTM', 'svg'),
    pngImage: getImage('beFTM', 'png'),
    description: 'beFTM',
    imageBGColor: '',
  },
  {
    svgImage: getImage('binSPIRIT', 'svg'),
    pngImage: getImage('binSPIRIT', 'png'),
    description: 'binSPIRIT',
    imageBGColor: '',
  },
  {
    svgImage: getImage('binSPIRIT-SPIRIT', 'svg'),
    pngImage: getImage('binSPIRIT_lp', 'png'),
    description: 'binSPIRIT LP',
    imageBGColor: '',
  },
];

export const BrandAssets = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.brandAssetsContainer}>
      <div className={classes.headerBox}>
        <img className={classes.logo} alt="BeefyLogo" src={getImage('BIFI', 'svg')} />
        <Typography variant="h2">{t('Footer-MediaKit')}</Typography>
      </div>
      <Typography className={classes.sectionHeader} variant="h4">
        {t('Logos')}
      </Typography>
      <div className={classes.cardContainer}>
        {LOGOS.map(logo => {
          return (
            <MediaCard
              imageBGColor={logo.imageBGColor}
              description={logo.description}
              pngImage={logo.pngImage}
              svgImage={logo.svgImage}
            />
          );
        })}
      </div>
      <Typography className={classes.sectionHeader} variant="h4">
        {t('Tokens')}
      </Typography>
      <div className={classes.cardContainer}>
        {TOKENS.map(logo => {
          return (
            <MediaCard
              imageBGColor={logo.imageBGColor}
              description={logo.description}
              pngImage={logo.pngImage}
              svgImage={logo.svgImage}
            />
          );
        })}
      </div>
    </Container>
  );
};

// eslint-disable-next-line no-restricted-syntax
export default BrandAssets;
