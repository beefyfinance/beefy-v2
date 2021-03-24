import React from "react";
import {FormControlLabel, Grid, makeStyles, Switch, TextField, Typography} from "@material-ui/core";
import styles from "./styles"
import {formatTvl} from "../../../../helpers/format";

const useStyles = makeStyles(styles);

const Filter = ({sortConfig, setKeyword, setRetired, tvl}) => {

    const classes = useStyles();
    const toggle = React.useCallback(() => {
        setRetired(!sortConfig.retired);
    }, [sortConfig, setRetired]);

    return(
        <Grid container className={classes.listFilter}>
            <Grid item xs={6}>
                <TextField size="small" label="Search by name" variant="outlined" value={sortConfig.keyword} onChange={(e) => setKeyword(e.target.value)} /><FormControlLabel checked={sortConfig.retired} className={classes.retiredLabel} name="retired" control={<Switch onChange={toggle} color="secondary" />} label="Show retired vaults"/>
            </Grid>
            <Grid item xs={6}>
                <Typography className={classes.tvl} align={'right'}>TVL: {formatTvl(tvl)}</Typography>
            </Grid>
        </Grid>
    )
}

export default Filter;
