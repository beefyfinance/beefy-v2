import { memo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { useTranslation } from 'react-i18next';
import techLoader from '../../images/tech-loader.gif';

const useStyles = legacyMakeStyles(styles);

export type LoadingIndicatorProps = {
  text?: string;
  css?: CssStyles;
  height?: number;
  width?: number;
};
export const LoadingIndicator = memo(function LoadingIndicator({
  text,
  css: cssProp,
  height = 80,
  width = 80,
}: LoadingIndicatorProps) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={css(styles.container, cssProp)}>
      <img
        src={techLoader}
        height={height}
        width={width}
        alt="tech loader"
        className={classes.icon}
      />
      <div className={classes.text}>{text ?? t('Loading')}</div>
    </div>
  );
});
