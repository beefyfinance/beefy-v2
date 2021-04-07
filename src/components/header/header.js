import * as React from "react";
import { useHistory } from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import {config} from '../../config/config';
import reduxActions from "../../features/redux/actions";
import {
    makeStyles,
    AppBar,
    Toolbar,
    Container,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Hidden,
    Drawer,
    Link,
    Box,
    MenuItem,
    FormControl,
    Select,
    InputLabel,
    Button
} from "@material-ui/core";
import {Menu, WbSunny, NightsStay} from "@material-ui/icons";
import styles from "./styles"
import {useLocation} from "react-router";
import WalletContainer from "./components/WalletContainer";

const useStyles = makeStyles(styles);

const navLinks = [
    { title: 'barn', path: 'https://barn.beefy.finance' },
    { title: 'vote', path: 'https://vote.beefy.finance' },
    { title: 'gov', path: 'https://gov.beefy.finance' },
    { title: 'stats', path: '/stats' },
    { title: 'docs', path: 'https://docs.beefy.finance' },
    { title: 'buy', path: 'https://classic.openocean.finance/exchange/BNB' },
];

const checkNetwork = (path) => {
    const params = path.substring(1).split('/');
    const match = params[0].replace(/[^0-9a-z]/gi, '');
    return match && (match in config) ? match : false;
}

const Header = ({isNightMode, setNightMode}) => {
    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();
    const walletReducer = useSelector(state => state.walletReducer);
    const classes = useStyles();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const urlParamNetwork = checkNetwork(location.pathname);

    if(urlParamNetwork) {
        dispatch(reduxActions.wallet.setNetwork(urlParamNetwork));
    }

    const handleNetworkSwitch = (event) => {
        dispatch(reduxActions.wallet.setNetwork(event.target.value));
        history.push('/');
    }

    return (
        <AppBar className={classes.navHeader} position="static">
            <Toolbar>
                <Container maxWidth="xl" className={classes.navDisplayFlex}>
                    <Box className={classes.beefy}>
                        <img alt="BIFI" src={require('../../images/BIFI.svg').default} />
                        <Button onClick={() => {history.push('/')}}>beefy.finance</Button>
                    </Box>
                    <Hidden smDown>
                        <List component="nav" aria-labelledby="main navigation" className={classes.navDisplayFlex}>
                            {navLinks.map(({ title, path }) => (
                                    <ListItem key={title} button onClick={() => {history.push(path)}}>
                                        <ListItemText primary={title} />
                                    </ListItem>
                            ))}
                            <IconButton onClick={setNightMode}>
                                {isNightMode ? <WbSunny /> : <NightsStay />}
                            </IconButton>
                            <Box className={classes.network}>
                                <FormControl variant="outlined">
                                    <InputLabel id="switch-network-label">Switch Network</InputLabel>
                                    <Select labelId="switch-network-label" value={walletReducer.network} onChange={handleNetworkSwitch} label="Switch Network">
                                        <MenuItem value={'bsc'}>Binance Smart Chain</MenuItem>
                                        <MenuItem value={'heco'}>Heco</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <WalletContainer />
                        </List>
                    </Hidden>
                    <Hidden mdUp>
                        <IconButton edge="start" aria-label="menu" onClick={handleDrawerToggle}>
                            <Menu fontSize="large" />
                        </IconButton>
                        <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
                            <div className={classes.list} role="presentation" onClick={handleDrawerToggle} onKeyDown={handleDrawerToggle}>
                                <List component="nav">
                                    {navLinks.map(({ title, path }) => (
                                        <Link  onClick={() => {history.push(path)}} key={title} className={classes.linkText}>
                                            <ListItem button className={classes.black}>
                                                <ListItemText primary={title} />
                                            </ListItem>
                                        </Link>
                                    ))}
                                </List>
                            </div>
                        </Drawer>
                    </Hidden>
                </Container>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
