import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type PartnerCardProps = {
  logo: string;
  title: string;
  content: string;
  url: string;
};
export const PartnerCard = memo<PartnerCardProps>(function ({ logo, title, content, url }) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <a href={url} target="__blank" className={classes.title}>
        <img src={logo} alt={title} className={classes.icon} /> {title}
      </a>
      <div className={classes.content}>{content}</div>
    </div>
  );
});
