import React from "react";
import {
    Box,
    Button, Checkbox,
    FormControlLabel, FormGroup,
    Grid,
    makeStyles,
    TextField, Typography,
} from "@material-ui/core";
import styles from "./styles"
import CustomDropdown from "../../../../components/customDropdown";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

const useStyles = makeStyles(styles);

const Filter = ({sortConfig, setFilter, defaultFilter}) => {

    const classes = useStyles();

    const [state, setState] = React.useState({
        key: sortConfig.key,
        keyword: sortConfig.keyword,
        zero: sortConfig.zero,
        retired: sortConfig.retired,
        deposited: sortConfig.deposited,
        boost: sortConfig.boost,
        experimental: sortConfig.experimental,
        platform: sortConfig.platform,
        vault: sortConfig.vault,
        blockchain: sortConfig.blockchain,
        category: sortConfig.category,
    });

    const handleCheckbox = (event) => {
        setState({ ...state, [event.target.name]: event.target.checked });
    };

    const handleChange = (name, value) => {
        setState({ ...state, [name]: value });
    };

    React.useEffect(() => {
        setFilter(state);
    }, [state]);

    return (
        <React.Fragment>
            <Grid container spacing={2} className={classes.categories}>
                <Grid item xs={12}>
                    <Typography variant={"h4"}>Categories</Typography>
                </Grid>
                <Grid item xs>
                    <Button className={state.category === 'all' ? classes.selected : classes.all} fullWidth={true} disabled={state.category === 'all'} onClick={() => handleChange('category', 'all')}>
                        <Typography className={classes.text}>All</Typography>
                        {state.category === 'all' ? (<ArrowDropDownIcon />) : ''}
                    </Button>
                </Grid>
                <Grid item xs>
                    <Button className={state.category === 'stable' ? classes.selected : classes.stable} fullWidth={true} disabled={state.category === 'stable'} onClick={() => handleChange('category', 'stable')}>
                        <Typography className={classes.text}>Stable coins</Typography>
                        {state.category === 'stable' ? (<ArrowDropDownIcon />) : ''}
                    </Button>
                </Grid>
                <Grid item xs>
                    <Button className={state.category === 'top' ? classes.selected : classes.top} fullWidth={true} disabled={state.category === 'top'} onClick={() => handleChange('category', 'top')}>
                        <Typography className={classes.text}>Top gainers</Typography>
                        {state.category === 'top' ? (<ArrowDropDownIcon />) : ''}
                    </Button>
                </Grid>
                <Grid item xs>
                    <Button className={state.category === 'recent' ? classes.selected : classes.recent} fullWidth={true} disabled={state.category === 'recent'} onClick={() => handleChange('category', 'recent')}>
                        <Typography className={classes.text}>Recently added</Typography>
                        {state.category === 'recent' ? (<ArrowDropDownIcon />) : ''}
                    </Button>
                </Grid>
                <Grid item xs>
                    <Button className={state.category === 'low' ? classes.selected : classes.low} fullWidth={true} disabled={state.category === 'low'} onClick={() => handleChange('category', 'low')}>
                        <Typography className={classes.text}>Low risk</Typography>
                        {state.category === 'low' ? (<ArrowDropDownIcon />) : ''}
                    </Button>
                </Grid>
            </Grid>
            <Box display="flex">
                <Box flexGrow={1}>
                    <TextField className={classes.searchInput} size="small" variant="outlined" label="Search by name" name="keyword" value={sortConfig.keyword} onChange={handleChange} InputProps={{className: classes.input}} />
                </Box>
                <Box>
                    <CustomDropdown list={{'default': 'Default', 'apy': 'APY', 'tvl': 'TVL'}} selected={state.key} name={"key"} handler={handleChange} label={'Sort by:'} css={{marginRight: 10}} />
                </Box>
                <Box>
                    <Button variant={"contained"}>Filter</Button>
                </Box>
            </Box>
            <Box className={classes.filters}>
                <Box display="flex">
                    <Box p={3}>
                        <FormGroup row>
                            <FormControlLabel label="Hide Zero balances"
                              control={<Checkbox checked={state.zero} onChange={handleCheckbox} name="zero" color="primary" />}
                            />
                            <FormControlLabel label="Retired vaults"
                              control={<Checkbox checked={state.retired} onChange={handleCheckbox} name="retired" color="primary" />}
                            />
                            <FormControlLabel label="Deposited vaults"
                              control={<Checkbox checked={state.deposited} onChange={handleCheckbox} name="deposited" color="primary" />}
                            />
                            <FormControlLabel label="Boost"
                              control={<Checkbox checked={state.boost} onChange={handleCheckbox} name="boost" color="primary" />}
                            />
                            <FormControlLabel label="Experimental"
                              control={<Checkbox checked={state.experimental} onChange={handleCheckbox} name="experimental" color="primary" />}
                            />
                        </FormGroup>
                    </Box>
                    <Box p={3} flexGrow={1} style={{textAlign: 'right'}}>Showing 125/125</Box>
                </Box>

                <Box display="flex">
                    <Box p={3} flexGrow={1} display={"flex"}>
                        <CustomDropdown list={{'all': 'All', '1inch': '1Inch', 'alpaca': 'Alpaca'}} selected={state.platform} handler={handleChange} name={"platform"} label={'Platform:'} />
                        <CustomDropdown list={{'all': 'All', 'single': 'Single assets', 'stable': 'Stable LPs', 'stables': 'Stables'}} selected={state.vault} handler={handleChange} name={"vault"} label={'Vault type:'} css={{marginLeft: 10}} />
                        <CustomDropdown list={{'all': 'All', 'bsc': 'BSC', 'heco': 'Heco', 'avax': 'Avalanche'}} selected={state.blockchain} handler={handleChange} name={"blockchain"} label={'Blockchain:'} css={{marginLeft: 10}} />
                    </Box>
                    <Box p={3}>
                        <Button variant={"contained"} onClick={() => {setState(defaultFilter)}}>Reset</Button>
                    </Box>
                </Box>
            </Box>
        </React.Fragment>
    )
}

export default Filter;
