import React from "react";
import {Button, makeStyles, Box} from "@material-ui/core";
import styles from "./styles"

const useStyles = makeStyles(styles);

const ListHeaderBtn = ({name, sort, sortConfig, requestSort}) => {
    const classes = useStyles();
    let obj = [classes.listHeaderBtnArrow]

    if(sortConfig && sortConfig.key === sort) {
        obj.push(sortConfig.direction === 'descending' ? classes.listHeaderBtnDesc : classes.listHeaderBtnAsc)
    }

    return (<Button className={classes.listHeaderBtn} disableRipple onClick={() => requestSort(sort)}>
            {name}
            <Box className={obj.join(' ')} />
        </Button>
    )
}

export default ListHeaderBtn;
