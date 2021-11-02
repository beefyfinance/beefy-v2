import React from 'react';
import { makeStyles, Box, MenuItem, Select } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { SimpleDropdownProps } from './SimpleDropdownProps';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  list,
  selected,
  handler,
  renderValue,
  chainLogos = false,
  noBorder = false,
}) => {
  const props = {
    noBorder: noBorder,
  };

  const classes = useStyles(props);

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
            {chainLogos && (
              <img alt={val} src={require(`../../images/networks/${val}.svg`).default} />
            )}{' '}
            {list[val]}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};