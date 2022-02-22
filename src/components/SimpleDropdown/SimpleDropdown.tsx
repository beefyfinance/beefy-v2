import { makeStyles, Box, MenuItem, Select, FormControl } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { isEmpty } from 'lodash';
import { ReactNode } from 'react';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export function SimpleDropdown({
  list,
  selected,
  handler,
  renderValue,
  noBorder = false,
  label,
}: {
  list: Record<string, string>;
  selected: string;
  handler: (selectedId: string) => void;
  renderValue: (selectedId: string) => ReactNode;
  noBorder: boolean;
  label?: string;
}) {
  const props = {
    noBorder: noBorder,
  };

  const classes = useStyles(props);

  return (
    <Box className={classes.select}>
      <FormControl>
        <Select
          labelId="chain-list-label"
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
          displayEmpty={true}
          renderValue={(selected: string | null) => {
            if (isEmpty(selected)) {
              if (label) {
                return <em>{label}</em>;
              } else {
                return <></>;
              }
            }
            return renderValue(selected);
          }}
          onChange={e => handler(e.target.value as string)}
          disableUnderline={true}
          IconComponent={ExpandMore}
          fullWidth
        >
          {Object.keys(list).map(val => (
            <MenuItem key={list[val]} value={val}>
              {renderValue(val)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
