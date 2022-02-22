import React from 'react';
import InlineSVG from 'svg-inline-react';
import { makeStyles, Box, Typography } from '@material-ui/core';
import { styles } from './styles';
import { CowCardProps } from './CowCardProps';

const useStyles = makeStyles(styles as any);

const CowCard: React.FC<CowCardProps> = ({ cow }) => {
  const classes = useStyles();
  return (
    <Box className={classes.card}>
      <Box className={classes.titleContainer}>
        <Typography variant="h3" className={classes.title}>
          {cow.name}
        </Typography>
        {/* TODO ADD TAGS */}
      </Box>
      <Box className={classes.imageContainer}>
        <InlineSVG src={cow.image_data} />
      </Box>
      <Box className={classes.footerContainer}></Box>
    </Box>
  );
};

export { CowCard };
