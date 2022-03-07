import React from 'react';
import { makeStyles, Tabs as MuiTabs, Tab } from '@material-ui/core';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const BasicTabs = ({ value, onChange, labels }) => {
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  return (
    <MuiTabs
      value={value}
      textColor="primary"
      onChange={handleChange}
      className={classes.basicTabs}
    >
      {labels.map(label => (
        <Tab label={label} key={label} />
      ))}
    </MuiTabs>
  );
};
