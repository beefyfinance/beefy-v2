import React, { memo } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { Card, CardContent, CardHeader } from '../Card';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type InsuranceCardProps = {
  logo: string;
  title: string;
  subtitle: string;
  content: string;
  buttonUrl: string;
  buttonText: string;
};
export const InsuranceCard = memo<InsuranceCardProps>(function ({
  logo,
  title,
  subtitle,
  content,
  buttonUrl,
  buttonText,
}) {
  const classes = useStyles();

  return (
    <Card>
      <CardHeader className={classes.header}>
        <img src={logo} alt={subtitle} />{' '}
        <div>
          <div className={classes.subtitle}>{subtitle}</div>
          <div className={classes.title}>{title}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={classes.content}>{content}</div>
        <Button target="_blank" rel="noreferrer" href={buttonUrl} className={classes.btn}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
});
