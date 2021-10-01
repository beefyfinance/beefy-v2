import * as React from 'react';
import styles from './styles';
import { Avatar, makeStyles } from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import { getSingleAssetSrc } from 'helpers/singleAssetSrc';

const useStyles = makeStyles(styles);

const AssetsImage = ({ img, assets, alt }) => {
  const classes = useStyles();
  const singleImage = img
    ? require('images/' + img).default
    : assets.length === 1
    ? getSingleAssetSrc(assets[0])
    : undefined;

  return singleImage ? (
    <Avatar
      className={classes.large}
      alt={alt}
      src={singleImage}
      variant="square"
      imgProps={{ style: { objectFit: 'contain' } }}
    />
  ) : (
    <AvatarGroup className={`${classes.icon} MuiAvatar-root MuiAvatar-square`} spacing="small">
      <Avatar
        alt={assets[0]}
        variant="square"
        imgProps={{ style: { objectFit: 'contain' } }}
        src={getSingleAssetSrc(assets[0])}
      />
      <Avatar
        alt={assets[1]}
        variant="square"
        imgProps={{ style: { objectFit: 'contain' } }}
        src={getSingleAssetSrc(assets[1])}
      />
    </AvatarGroup>
  );
};

export default AssetsImage;
