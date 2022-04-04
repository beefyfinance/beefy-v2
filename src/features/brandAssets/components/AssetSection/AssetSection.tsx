import { useTranslation } from 'react-i18next';
import { makeStyles, Typography } from '@material-ui/core';
import { styles } from './styles';
import React from 'react';
import { MediaCard } from '../MediaCard';
import { AssetSectionProps } from './AssetSectionProps';

const useStyles = makeStyles(styles as any);

export const AssetSection: React.FC<AssetSectionProps> = ({ id, assets }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography className={classes.sectionHeader} variant="h4">
        {t(id)}
      </Typography>
      <div className={classes.cardContainer}>
        {assets.map(asset => {
          return (
            <MediaCard id={asset.id} versions={asset.versions} background={asset.background} />
          );
        })}
      </div>
    </React.Fragment>
  );
};
