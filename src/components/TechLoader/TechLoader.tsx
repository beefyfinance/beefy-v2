import { memo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import loadingImage from '../../images/tech-loader.gif';
import { css, type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type TechLoaderProps = {
  css?: CssStyles;
  text?: string;
};

export const TechLoader = memo(function TechLoader({ text, css: cssProp }: TechLoaderProps) {
  const classes = useStyles();
  return (
    <div className={css(styles.loader, cssProp)}>
      <img alt="Loading..." src={loadingImage} width={718 / 2} height={718 / 2} />
      {text ?
        <div className={classes.text}>{text}</div>
      : null}
    </div>
  );
});

export const FullscreenTechLoader = memo(function FullscreenTechLoader({ text }: TechLoaderProps) {
  const classes = useStyles();
  return (
    <div className={classes.fullscreen}>
      <TechLoader text={text} />
    </div>
  );
});
