import { memo, ReactNode } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(styles);

export type BasicTooltipContentProps = {
  title: string;
  content?: ReactNode;
};
export const BasicTooltipContent = memo<BasicTooltipContentProps>(function BasicTooltipContent({
  title,
  content,
}) {
  const classes = useStyles();

  return (
    <>
      <div className={classes.basicTitle}>{title}</div>
      {content ? <div className={classes.basicContent}>{content}</div> : null}
    </>
  );
});
