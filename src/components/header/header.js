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
    Button
} from "@material-ui/core";
import {Menu, WbSunny, NightsStay} from "@material-ui/icons";
import styles from "./styles"
import {useLocation} from "react-router";
import WalletContainer from "./components/WalletContainer";
import CustomDropdown from "../customDropdown/CustomDropdown";

const useStyles = makeStyles(styles);

const navLinks = [
    { title: 'home', path: '/' },
    { title: 'explore', path: '/explore' },
    { title: 'docs', path: 'https://docs.beefy.finance' },
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

    if(urlParamNetwork && urlParamNetwork !== walletReducer.network) {
        dispatch(reduxActions.wallet.setNetwork(urlParamNetwork));
    }

    const handleNetworkSwitch = (event) => {
        dispatch(reduxActions.wallet.setNetwork(event.target.value));
        history.push('/');
    }

    const handleLanguageSwitch = (event) => {
        //dispatch(reduxActions.wallet.setNetwork(event.target.value));
        //history.push('/');
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
                            <CustomDropdown list={{'en': 'EN', 'fr': 'FR'}} selected={walletReducer.language} handler={handleLanguageSwitch} css={{marginLeft: 10}} />
                            <CustomDropdown list={{'bsc': 'BSC', 'heco': 'Heco'}} selected={walletReducer.network} handler={handleNetworkSwitch} css={{marginLeft: 10}} />
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
                                        <Link  onClick={() => {history.push(path)}} key={title}>
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
