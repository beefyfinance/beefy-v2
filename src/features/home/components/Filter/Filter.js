import React from "react";
import AnimateHeight from 'react-animate-height';
import {useTranslation} from "react-i18next";
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
import {getAvailableNetworks} from "../../../../helpers/utils";
import {ToggleButton} from "@material-ui/lab";

const useStyles = makeStyles(styles);

const Filter = ({sortConfig, setSortConfig, defaultFilter, platforms, vaultCount}) => {
    const classes = useStyles();
    const t = useTranslation().t;
    const [filterOpen, setFilterOpen] = React.useState(false);

    const handleCheckbox = (event) => {
        setSortConfig({ ...sortConfig, [event.target.name]: event.target.checked })
    };

    const handleChange = (name, value) => {
        setSortConfig({ ...sortConfig, [name]: value })
    };

    const getPlatformTypes = () => {
        return {
            'all': t( 'Filter-DropDwnDflt'),
            ...platforms
        }
    }

    const getVaultTypes = () => {
        return {
            'all': t( 'Filter-DropDwnDflt'),
            'single': t( 'Filter-AsstSingle'),
            'stable': t( 'Filter-AsstStableLP'),
            'stables': t( 'Filter-AsstStables')
        }
    }

    const getNetworkTypes = () => {
        return {
            'all': t( 'Filter-DropDwnDflt'),
            ...getAvailableNetworks()
        };
    }

    return (
        <React.Fragment>
            <Grid container spacing={2} className={classes.categories}>
                <Grid item xs={12}>
                    <Typography variant={"h4"}>{t( 'Filter-Classes')}</Typography>
                </Grid>
                <Grid item xs>
                    <Button className={sortConfig.category === 'all' ? classes.selected : classes.all} fullWidth={true} disabled={sortConfig.category === 'all'} onClick={() => handleChange('category', 'all')}>
                        <Typography className={classes.text}>{t( 'Filter-ClassAll')}</Typography>
                        {sortConfig.category === 'all' ? (<ArrowDropDownIcon />) : ''}
                    </Button>
                </Grid>
                <Grid item xs>
                    <Button className={sortConfig.category === 'stable' ? classes.selected : classes.stable} fullWidth={true} disabled={sortConfig.category === 'stable'} onClick={() => handleChange('category', 'stable')}>
                        <Typography className={classes.text}>{t( 'Filter-ClassStabl')}</Typography>
                        {sortConfig.category === 'stable' ? (<ArrowDropDownIcon />) : ''}
                    </Button>
                </Grid>
                <Grid item xs>
                    <Button className={sortConfig.category === 'top' ? classes.selected : classes.top} fullWidth={true} disabled={sortConfig.category === 'top'} onClick={() => handleChange('category', 'top')}>
                        <Typography className={classes.text}>{t( 'Filter-ClassTop')}</Typography>
                        {sortConfig.category === 'top' ? (<ArrowDropDownIcon />) : ''}
                    </Button>
                </Grid>
                <Grid item xs>
                    <Button className={sortConfig.category === 'recent' ? classes.selected : classes.recent} fullWidth={true} disabled={sortConfig.category === 'recent'} onClick={() => handleChange('category', 'recent')}>
                        <Typography className={classes.text}>{t( 'Filter-ClassRecnt')}</Typography>
                        {sortConfig.category === 'recent' ? (<ArrowDropDownIcon />) : ''}
                    </Button>
                </Grid>
                <Grid item xs>
                    <Button className={sortConfig.category === 'low' ? classes.selected : classes.low} fullWidth={true} disabled={sortConfig.category === 'low'} onClick={() => handleChange('category', 'low')}>
                        <Typography className={classes.text}>{t( 'Filter-ClassLowRsk')}</Typography>
                        {sortConfig.category === 'low' ? (<ArrowDropDownIcon />) : ''}
                    </Button>
                </Grid>
            </Grid>
            <Box display="flex">
                <Box flexGrow={1}>
                    <TextField className={classes.searchInput} size="small" variant="outlined" label="Search by name" value={sortConfig.keyword} onChange={(e) => handleChange('keyword', e.target.value)} InputProps={{className: classes.input}} />
                </Box>
                <Box>
                    <CustomDropdown list={{'default': 'Default', 'apy': 'APY', 'tvl': 'TVL', 'safetyScore': 'SAFETY'}} selected={sortConfig.key} handler={(e) => handleChange('key', e.target.value)} label={'Sort by:'} css={{marginRight: 10}} />
                </Box>
                <Box className={classes.btnFilter}>
                    <ToggleButton value={filterOpen} selected={filterOpen} onChange={() => {setFilterOpen(!filterOpen)}}>Filter {filterOpen ? (<ArrowDropDownIcon />) : ''}</ToggleButton>
                </Box>
            </Box>
            <AnimateHeight duration={ 500 } height={ filterOpen ? 'auto' : 0 }>
                <Box className={classes.filters}>
                    <Box display="flex">
                        <Box p={3}>
                            <FormGroup row>
                                <FormControlLabel label="Hide Zero balances"
                                                  control={<Checkbox checked={sortConfig.zero} onChange={handleCheckbox} name="zero" color="primary" />}
                                />
                                <FormControlLabel label="Retired vaults"
                                                  control={<Checkbox checked={sortConfig.retired} onChange={handleCheckbox} name="retired" color="primary" />}
                                />
                                <FormControlLabel label="Deposited vaults"
                                                  control={<Checkbox checked={sortConfig.deposited} onChange={handleCheckbox} name="deposited" color="primary" />}
                                />
                                <FormControlLabel label="Boost"
                                                  control={<Checkbox checked={sortConfig.boost} onChange={handleCheckbox} name="boost" color="primary" />}
                                />
                                <FormControlLabel label="Experimental"
                                                  control={<Checkbox checked={sortConfig.experimental} onChange={handleCheckbox} name="experimental" color="primary" />}
                                />
                            </FormGroup>
                        </Box>
                        <Box p={3} flexGrow={1} style={{textAlign: 'right'}}>Showing {vaultCount.showing}/{vaultCount.total}</Box>
                    </Box>

                    <Box display="flex">
                        <Box p={3} flexGrow={1} display={"flex"}>
                            <CustomDropdown list={getPlatformTypes()} selected={sortConfig.platform} handler={(e) => handleChange('platform', e.target.value)} label={'Platform:'} />
                            <CustomDropdown list={getVaultTypes()} selected={sortConfig.vault} handler={(e) => handleChange('vault', e.target.value)} label={'Vault type:'} css={{marginLeft: 10}} />
                            <CustomDropdown list={getNetworkTypes()} selected={sortConfig.blockchain} handler={(e) => handleChange('blockchain', e.target.value)} label={'Blockchain:'} css={{marginLeft: 10}} />
                        </Box>
                        <Box p={3}>
                            <Button className={classes.btnReset} variant={"contained"} onClick={() => {setSortConfig(defaultFilter)}}>Reset</Button>
                        </Box>
                    </Box>
                </Box>
            </AnimateHeight>
        </React.Fragment>
    )
}

export default Filter;
