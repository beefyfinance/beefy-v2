import * as React from 'react';
import { styles } from './styles';
import Avatar from '@material-ui/core/Avatar';
import makeStyles from '@material-ui/styles/makeStyles';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import { getSingleAssetSrc } from '../../helpers/singleAssetSrc';

const useStyles = makeStyles(styles as any);
const resolveImgSrc = (img, assets) => {
  if (img) {
    return require(`../../images/${img}`).default;
  }
  return assets.length === 1 ? getSingleAssetSrc(assets[0]) : undefined;
};

export const AssetsImage = ({ img, assets, alt }) => {
  const classes = useStyles();
  const singleImage = resolveImgSrc(img, assets);

  return singleImage ? (
    <Avatar
      className={(classes as any).large}
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
