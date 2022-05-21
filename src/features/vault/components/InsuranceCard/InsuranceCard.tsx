import React, { memo } from 'react';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
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
        <Box>
          <Typography className={classes.subtitle} variant="body1">
            {subtitle}
          </Typography>
          <Typography className={classes.title} variant="h3">
            {title}
          </Typography>
        </Box>
      </CardHeader>
      <CardContent>
        <Typography className={classes.content} variant="body1">
          {content}
        </Typography>
        <a className={classes.link} target="_blank" rel="noreferrer" href={buttonUrl}>
          <Button className={classes.btn}>{buttonText}</Button>
        </a>
      </CardContent>
    </Card>
  );
});
