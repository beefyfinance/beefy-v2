import React from 'react';
import remove from 'lodash/remove';
import { makeStyles, Box, MenuItem, Select, Typography } from '@material-ui/core';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { LabeledDropdownProps } from './LabeledDropdownProps';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const LabeledDropdown: React.FC<LabeledDropdownProps> = ({
  list,
  selected,
  handler,
  label,
  renderValue,
  selectStyle,
  fullWidth,
}) => {
  const props = {
    fullWidth,
  };
  const classes = useStyles(props);

  let sortedList = Object.keys(list).sort((a, b) => (a > b ? 1 : -1));
  if (sortedList.includes('all')) {
    remove(sortedList, n => n === 'all');
    sortedList = ['all', ...sortedList];
  }
  if (sortedList.includes('default')) {
    remove(sortedList, n => n === 'default');
    sortedList = ['default', ...sortedList];
  }

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
        renderValue={renderValue} // TODO: renable
        style={selectStyle}
      >
        {sortedList.map(val => (
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
