import React from 'react';
import { Card, Button, makeStyles, CardMedia } from '@material-ui/core';
import { styles } from './styles';
import { useTheme } from '@material-ui/core/styles';
import { SimpleLinkButton } from '../../../../components/SimpleLinkButton';
import { MediaCardProps } from './MediaCardProps';
import { getSingleAssetSrc } from '../../../../helpers/singleAssetSrc';

const useStyles = makeStyles(styles as any);

export const MediaCard: React.FC<MediaCardProps> = ({
  svgImage,
  pngImage,
  description,
  imageBGColor,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <Card className={classes.cardStyle}>
      <div className={classes.imageContainer} style={{ backgroundColor: imageBGColor }}>
        <CardMedia component="img" alt="MediaImg" image={svgImage} className={classes.cardImage} />
      </div>
      <div className={classes.actionContainer}>
        <p className={classes.description}>{description}</p>
        <div className={classes.actions}>
          <SimpleLinkButton text="Download SVG" href={svgImage} />
          <SimpleLinkButton text="Download PNG" href={pngImage} />
        </div>
      </div>
    </Card>
  );
};
