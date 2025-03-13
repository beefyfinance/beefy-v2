import { legacyMakeStyles } from '../../helpers/mui.ts';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { styles } from './styles.ts';
import { Container } from '../Container/Container.tsx';

const useStyles = legacyMakeStyles(styles);

interface SectionProps {
  title?: string;
  subTitle?: string;
  children: ReactNode;
}

export const Section = memo(function Section({ title, subTitle, children }: SectionProps) {
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
