import React from 'react';
import remove from 'lodash/remove';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import makeStyles from '@material-ui/styles/makeStyles';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { MultipleLabeledDropdownProps } from './MultipleLabeledDropdownProps';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const MultipleLabeledDropdown: React.FC<MultipleLabeledDropdownProps> = ({
  list,
  selected,
  handler,
  label,
  renderValue,
  selectStyle,
  fullWidth,
  multiple,
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
        multiple={multiple}
      >
        {sortedList.map(val => (
          <MenuItem key={list[val]} value={val}>
            <Checkbox className={classes.checkbox} checked={selected.indexOf(val) > -1} />
            <Typography className={classes.value}>
              <span className={`${classes.label} label`}>{label}</span> {list[val]}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
