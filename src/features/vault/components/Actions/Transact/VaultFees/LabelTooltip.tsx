import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import {
  BasicTooltipContent,
  BasicTooltipContentProps,
} from '../../../../../../components/Tooltip/BasicTooltipContent';
import { IconWithTooltip, IconWithTooltipProps } from '../../../../../../components/Tooltip';

const useStyles = makeStyles({
  trigger: {
    width: '16px',
    height: '16px',
    margin: 0,
    verticalAlign: 'middle',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
});

export type LabelTooltipProps = {} & BasicTooltipContentProps;

export const LabelTooltip = memo<LabelTooltipProps>(function LabelTooltip({ title, content }) {
  const classes = useStyles();
  return (
    <IconWithTooltip
      triggerClass={classes.trigger}
      content={<BasicTooltipContent title={title} content={content} />}
    />
  );
});

export type LabelCustomTooltipProps = Omit<IconWithTooltipProps, 'triggerClass'>;

export const LabelCustomTooltip = memo<LabelCustomTooltipProps>(function LabelCustomTooltip(props) {
  const classes = useStyles();
  return <IconWithTooltip triggerClass={classes.trigger} {...props} />;
});
