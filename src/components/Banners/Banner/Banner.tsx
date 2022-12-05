import React, { memo, ReactNode } from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Clear } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export type BannerProps = {
  icon?: ReactNode;
  text: ReactNode;
  onClose: () => void;
  className?: string;
};
export const Banner = memo<BannerProps>(function Banner({ icon, text, onClose, className }) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Container maxWidth="lg">
        <div className={classes.box}>
          <div className={classes.content}>
            {icon}
            <div className={classes.text}>{text}</div>
          </div>
          <Clear onClick={onClose} className={classes.cross} />
        </div>
      </Container>
    </div>
  );
});
