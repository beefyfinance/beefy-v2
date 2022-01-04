import React from 'react';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/styles/makeStyles';
import { styles } from './styles';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import CodeRoundedIcon from '@material-ui/icons/CodeRounded';
import InsertIcon from '@material-ui/icons/InsertLink';
import { LinkButtonProps } from './LinkButtonProps';

const useStyles = makeStyles(styles as any);
export const LinkButton: React.FC<LinkButtonProps> = ({ href, text, type }) => {
  const classes = useStyles();
  return (
    <a className={classes.container} href={href} target="_blank" rel="noopener noreferrer">
      {type === 'code' && <CodeRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}
      {type === 'link' && <InsertIcon fontSize="small" htmlColor="#D0D0DA" />}
      <Typography variant="body1" className={classes.text}>
        {text}
      </Typography>
      <OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />
    </a>
  );
};
