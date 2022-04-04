import React from 'react';
import { Card, makeStyles, CardMedia } from '@material-ui/core';
import { styles } from './styles';
import { SimpleLinkButton } from '../../../../components/SimpleLinkButton';
import { MediaCardProps } from './MediaCardProps';

const useStyles = makeStyles(styles);

function getImage(imageName, fileType) {
  return require(`../../../../images/brand-assets/${fileType.toUpperCase()}/${imageName}.${fileType.toLowerCase()}`)
    .default;
}

export const MediaCard: React.FC<MediaCardProps> = ({ id, versions, background }) => {
  const classes = useStyles();
  const svg = versions[0];
  const png = versions[1];
  return (
    <Card className={classes.cardStyle}>
      <div className={classes.imageContainer} style={{ backgroundColor: background }}>
        <CardMedia
          component="img"
          alt="MediaImg"
          image={getImage(svg.fileName, svg.type)}
          className={classes.cardImage}
        />
      </div>
      <div className={classes.actionContainer}>
        <p className={classes.description}>{id}</p>
        <div className={classes.actions}>
          <SimpleLinkButton text="Download SVG" href={getImage(svg.fileName, svg.type)} />
          <SimpleLinkButton text="Download PNG" href={getImage(png.fileName, png.type)} />
        </div>
      </div>
    </Card>
  );
};
