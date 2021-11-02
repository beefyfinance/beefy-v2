import React from 'react';
import { Button, makeStyles, Box } from '@material-ui/core';
import { styles } from './styles';
import { ListHeaderBtnProps } from './ListHeaderBtnProps';

const useStyles = makeStyles(styles as any);
export const ListHeaderBtn: React.FC<ListHeaderBtnProps> = ({ name, sort, sortConfig, requestSort }) => {
  const classes = useStyles();
  let obj = [classes.listHeaderBtnArrow];

  if (sortConfig && sortConfig.key === sort) {
    obj.push(
      sortConfig.direction === 'desc' ? classes.listHeaderBtnDesc : classes.listHeaderBtnAsc
    );
  }

  return (
    <Button className={classes.listHeaderBtn} disableRipple onClick={() => requestSort(sort)}>
      {name}
      <Box className={obj.join(' ')} />
    </Button>
  );
};