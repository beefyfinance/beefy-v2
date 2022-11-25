import { Container, makeStyles } from '@material-ui/core';
import React, { memo, ReactNode } from 'react';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface SectionProps {
  title?: string;
  children: ReactNode;
}

export const Section = memo<SectionProps>(function ({ title, children }) {
  const classes = useStyles();
  return (
    <div className={classes.sectionContainer}>
      <Container maxWidth="lg">
        {title && <div className={classes.title}>{title}</div>}
        {children}
      </Container>
    </div>
  );
});
