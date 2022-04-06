import React from 'react';
import { Card, makeStyles, CardMedia } from '@material-ui/core';
import { styles } from './styles';
import { SimpleLinkButton } from '../../../../components/SimpleLinkButton';
import { MediaCardProps } from './MediaCardProps';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

function getImage(imageName, fileType) {
  return require(`../../../../images/brand-assets/${fileType.toUpperCase()}/${imageName}.${fileType.toLowerCase()}`)
    .default;
}

export const MediaCard: React.FC<MediaCardProps> = ({ id, versions, background }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Card className={classes.cardStyle}>
      <div
        className={clsx(
          classes.imageContainer,
          classes[`imageContainer${background.charAt(0).toUpperCase() + background.slice(1)}`]
        )}
      >
        <CardMedia
          component="img"
          alt="MediaImg"
          image={getImage(versions[0].fileName, versions[0].type)}
          className={classes.cardImage}
        />
      </div>
      <div className={classes.actionContainer}>
        <p className={classes.description}>{t(`BrandAssets-Asset-${id}`)}</p>
        <div className={classes.actions}>
          {versions.map(version => (
            <SimpleLinkButton
              key={`${version.fileName}.${version.type}`}
              text={t(`BrandAssets-Download-${version.type.toUpperCase()}`)}
              href={getImage(version.fileName, version.type)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};
