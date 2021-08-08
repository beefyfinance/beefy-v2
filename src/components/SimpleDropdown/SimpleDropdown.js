import React from 'react';
import { makeStyles, Box, MenuItem, Select, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';

import styles from './styles';

const useStyles = makeStyles(styles);

const SimpleDropdown = ({ list, selected, handler, renderValue }) => {
  const classes = useStyles();

  return (
    <Box className={classes.select}>
      <Select
        MenuProps={{ classes: { list: classes.selectList } }}
        value={selected}
        onChange={handler}
        disableUnderline={true}
        IconComponent={ExpandMore}
        renderValue={renderValue}
        fullWidth
      >
        {Object.keys(list).map(val => (
          <MenuItem key={list[val]} value={val}>
            {list[val]}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default SimpleDropdown;
