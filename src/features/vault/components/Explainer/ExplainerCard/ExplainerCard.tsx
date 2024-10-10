import { memo, type ReactElement, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { Card, CardContent, CardHeader } from '../../Card';
import { styles } from './styles';
import { ContractsDropdown } from '../ContractsDropdown';

const useStyles = makeStyles(styles);

type ExplainerCardProps = {
  className?: string;
  title: ReactElement;
  links?: { label: string; link: string }[];
  description: ReactElement;
  details?: ReactNode;
};

export const ExplainerCard = memo<ExplainerCardProps>(function ExplainerCard({
  title,
  links,
  description,
  details,
  className,
}) {
  const classes = useStyles();

  return (
    <Card className={className}>
      <CardHeader className={classes.header}>
        <div className={classes.title}>{title}</div>
        {links ? <ContractsDropdown links={links} /> : null}
      </CardHeader>
      <CardContent className={classes.content}>
        <div className={classes.description}>{description}</div>
        {details ? <div className={classes.details}>{details}</div> : null}
      </CardContent>
    </Card>
  );
});
