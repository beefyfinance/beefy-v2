import React from 'react';
import { makeStyles, Box, MenuItem, Select, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { LabeledDropdownProps } from './LabeledDropdownProps';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const LabeledDropdown: React.FC<LabeledDropdownProps> = ({ list, selected, handler, label, renderValue, selectStyle }) => {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <Select
        className={classes.select}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          getContentAnchorEl: null,
          classes: { list: classes.selectList },
        }}
        value={selected}
        onChange={handler}
        disableUnderline={true}
        IconComponent={ExpandMore}
        // renderValue={renderValue} // TODO: renable
        style={selectStyle}
      >
        {Object.keys(list).map(val => (
          <MenuItem key={list[val]} value={val}>
            <Typography className={classes.value}>
              <span className={`${classes.label} label`}>{label}</span> {list[val]}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
