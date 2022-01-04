import React from 'react';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/styles/makeStyles';
import ExpandMore from '@material-ui/icons/ExpandMore';
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
