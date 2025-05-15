import type { ReactNode } from 'react';
import { memo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import ReportProblemOutlined from '../../../../../../images/icons/mui/ReportProblemOutlined.svg?react';
import { css, type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type ErrorIndicatorProps = {
  title: string | ReactNode;
  content?: string | ReactNode;
  css?: CssStyles;
};

export const ErrorIndicator = memo(function ErrorIndicator({
  title,
  content,
  css: cssProp,
}: ErrorIndicatorProps) {
  const classes = useStyles();

  return (
    <div className={css(styles.container, cssProp)}>
      <div className={classes.circle}>
        <ReportProblemOutlined className={classes.icon} />
      </div>
      <div className={classes.title}>{title}</div>
      {content ?
        <div className={classes.content}>{content}</div>
      : null}
    </div>
  );
});
