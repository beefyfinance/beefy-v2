import { Container, makeStyles } from '@material-ui/core';
import type { ReactNode } from 'react';
import React, { memo } from 'react';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface SectionProps {
  title?: string;
  subTitle?: string;
  children: ReactNode;
}

export const Section = memo<SectionProps>(function Section({ title, subTitle, children }) {
  const classes = useStyles();
  return (
    <div className={classes.sectionContainer}>
      <Container maxWidth="lg">
        <div className={classes.titleContainer}>
          {title && <div className={classes.title}>{title}</div>}
          {subTitle && <div className={classes.subTitle}>{subTitle}</div>}
        </div>
        {children}
      </Container>
    </div>
  );
});
