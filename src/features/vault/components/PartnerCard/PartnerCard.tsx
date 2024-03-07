import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type PartnerCardProps = {
  logo?: string;
  title: string;
  content: string;
  url: string;
};
export const PartnerCard = memo<PartnerCardProps>(function PartnerCard({
  logo,
  title,
  content,
  url,
}) {
  const classes = useStyles();

  return (
    <a href={url} target="__blank" className={classes.link}>
      <div className={classes.container}>
        <div className={classes.title}>
          {logo ? <img src={logo} alt={title} className={classes.icon} /> : null} {title}
        </div>
        <div className={classes.content}>{content}</div>
      </div>
    </a>
  );
});
