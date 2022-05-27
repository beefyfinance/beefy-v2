import React from 'react';
import { Card, CardMedia, makeStyles } from '@material-ui/core';
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
      <div className={clsx(classes.imageContainer, classes[`${background}ImageContainer`])}>
        <CardMedia
          component="img"
          alt="MediaImg"
          image={getImage(versions[0].fileName, versions[0].type)}
          className={classes.cardImage}
        />
      </div>
      <div className={classes.actionContainer}>
        <div className={classes.description}>{t(`BrandAssets-Asset-${id}`)}</div>
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
