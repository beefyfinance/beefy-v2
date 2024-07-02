import React, { memo, type ReactElement, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { Card, CardContent, CardHeader } from '../../Card';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type ExplainerCardProps = {
  className?: string;
  title: ReactElement;
  actions?: ReactNode;
  description: ReactElement;
  details?: ReactNode;
};

export const ExplainerCard = memo<ExplainerCardProps>(function ExplainerCard({
  title,
  actions,
  description,
  details,
  className,
}) {
  const classes = useStyles();

  return (
    <Card className={className}>
      <CardHeader className={classes.header}>
        <div className={classes.title}>{title}</div>
        {actions ? <div className={classes.actions}>{actions}</div> : null}
      </CardHeader>
      <CardContent className={classes.content}>
        <div className={classes.description}>{description}</div>
        {details ? <div className={classes.details}>{details}</div> : null}
      </CardContent>
    </Card>
  );
});
