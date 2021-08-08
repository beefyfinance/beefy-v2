import React from 'react';
import { makeStyles, Box, MenuItem, Select, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';

import styles from './styles';

const useStyles = makeStyles(styles);

const LabeledDropdown = ({ list, selected, handler, label, renderValue }) => {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <Typography className={classes.label}>{label}</Typography>
      <Select
        className={classes.select}
        MenuProps={{ classes: { list: classes.selectList } }}
        value={selected}
        onChange={handler}
        disableUnderline={true}
        IconComponent={ExpandMore}
        renderValue={renderValue}
      >
        {Object.keys(list).map(val => (
          <MenuItem key={list[val]} value={val}>
            <Typography className={classes.value}>{list[val]}</Typography>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default LabeledDropdown;
