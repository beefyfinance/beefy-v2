import {Box, makeStyles} from "@material-ui/core";
import React from "react";
import styles from "./styles"

const useStyles = makeStyles(styles);

const Loader = ({message, line}) => {
    const classes = useStyles();
    return (<Box textAlign={'center'}>{message}<Box className={line ? classes.line : classes.circle} /></Box>
    )
}

export default Loader;
