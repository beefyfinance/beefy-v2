import { memo, type ReactElement, type ReactNode } from 'react';
import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import { Card } from '../../Card/Card.tsx';
import { CardContent } from '../../Card/CardContent.tsx';
import { CardHeader } from '../../Card/CardHeader.tsx';
import { styles } from './styles.ts';
import { ContractsDropdown } from '../ContractsDropdown/ContractsDropdown.tsx';
import { type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

type ExplainerCardProps = {
  css?: CssStyles;
  title: ReactElement;
  links?: {
    label: string;
    link: string;
  }[];
  description: ReactElement;
  details?: ReactNode;
};

export const ExplainerCard = memo(function ExplainerCard({
  title,
  links,
  description,
  details,
  css: cssProp,
}: ExplainerCardProps) {
  const classes = useStyles();

  return (
    <Card css={cssProp}>
      <CardHeader>
        <div>{title}</div>
        {links ?
          <ContractsDropdown links={links} />
        : null}
      </CardHeader>
      <CardContent css={styles.content}>
        <div className={classes.description}>{description}</div>
        {details ?
          <div className={classes.details}>{details}</div>
        : null}
      </CardContent>
    </Card>
  );
});
