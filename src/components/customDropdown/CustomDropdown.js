import * as React from "react";
import {makeStyles, Box, MenuItem, Select, Typography,} from "@material-ui/core";
import {ExpandMore} from "@material-ui/icons";
import styles from "./styles"

const useStyles = makeStyles(styles);

const CustomDropdown = ({list, selected, handler, name, label, css, renderValue}) => {
    const classes = useStyles();

    return (
        <Box className={classes.select} style={css}>
            {label && selected === 'all' ? (<Typography>{label}</Typography>) : ''}
            <Select className={label ? classes.withLabel : ''} MenuProps={{classes: {list: classes.selectList}}} value={selected} name={name} onChange={handler} disableUnderline={true} IconComponent={ExpandMore} renderValue={renderValue}>
                {Object.keys(list).map(val => (
                    <MenuItem key={list[val]} value={val}>{list[val]}</MenuItem>
                ))}
            </Select>
        </Box>
    );
};

export default CustomDropdown;
