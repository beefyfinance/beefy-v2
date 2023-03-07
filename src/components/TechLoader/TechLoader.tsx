import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import loadingImage from '../../images/tech-loader.gif';

const useStyles = makeStyles(styles);

export type TechLoaderProps = {
  text?: string;
};

export const TechLoader = memo<TechLoaderProps>(function ({ text }) {
  const classes = useStyles();
  return (
    <div className={classes.loader}>
      <img
        alt="Loading..."
        className={classes.image}
        src={loadingImage}
        width={718 / 2}
        height={718 / 2}
      />
      {text ? <div className={classes.text}>{text}</div> : null}
    </div>
  );
});

export const FullscreenTechLoader = memo<TechLoaderProps>(function ({ text }) {
  const classes = useStyles();
  return (
    <div className={classes.fullscreen}>
      <TechLoader text={text} />
    </div>
  );
});
