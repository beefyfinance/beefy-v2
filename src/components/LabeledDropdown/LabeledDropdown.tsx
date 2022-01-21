import React from 'react';
import _ from 'lodash';
import { makeStyles, Box, MenuItem, Select, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
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
  noBorder,
}) => {
  const props = {
    fullWidth,
    noBorder,
  };
  const classes = useStyles(props);

  let sortedList = Object.keys(list).sort((a, b) => (a > b ? 1 : -1));
  if (sortedList.includes('all')) {
    _.remove(sortedList, n => n === 'all');
    sortedList = ['all', ...sortedList];
  }
  if (sortedList.includes('default')) {
    _.remove(sortedList, n => n === 'default');
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
