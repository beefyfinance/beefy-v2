import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import React from 'react';
import { MediaCard } from '../MediaCard';
import { AssetSectionProps } from './AssetSectionProps';

const useStyles = makeStyles(styles);

export const AssetSection: React.FC<AssetSectionProps> = ({ id, assets }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <React.Fragment>
      <h2 className={classes.sectionHeader}>{t(id)}</h2>
      <div className={classes.cardContainer}>
        {assets.map(asset => (
          <MediaCard
            key={asset.id}
            id={asset.id}
            versions={asset.versions}
            background={asset.background}
          />
        ))}
      </div>
    </React.Fragment>
  );
};
