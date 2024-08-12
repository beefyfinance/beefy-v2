import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import loadingImage from '../../images/tech-loader.gif';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type TechLoaderProps = {
  className?: string;
  text?: string;
};

export const TechLoader = memo<TechLoaderProps>(function TechLoader({ text, className }) {
  const classes = useStyles();
  return (
    <div className={clsx(classes.loader, className)}>
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

export const FullscreenTechLoader = memo<TechLoaderProps>(function FullscreenTechLoader({ text }) {
  const classes = useStyles();
  return (
    <div className={classes.fullscreen}>
      <TechLoader text={text} />
    </div>
  );
});
