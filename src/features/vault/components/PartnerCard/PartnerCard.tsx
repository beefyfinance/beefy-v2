import { memo } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type PartnerCardProps = {
  logo?: string;
  title: string;
  content: string;
  url: string;
};
export const PartnerCard = memo(function PartnerCard({
  logo,
  title,
  content,
  url,
}: PartnerCardProps) {
  const classes = useStyles();

  return (
    <a href={url} target="_blank" className={classes.link}>
      <div className={classes.container}>
        <div className={classes.title}>
          {logo ?
            <img src={logo} alt={title} className={classes.icon} />
          : null}{' '}
          {title}
        </div>
        <div className={classes.content}>{content}</div>
      </div>
    </a>
  );
});
