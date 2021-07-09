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
import {getAvailableNetworks} from "../../helpers/utils";
import { useTranslation } from "react-i18next";
import { localeToLanguageMap } from "../../utils/localeToLanguageMap"

const useStyles = makeStyles(styles);



const checkNetwork = (path) => {
    const params = path.substring(1).split('/');
    const match = params[0].replace(/[^0-9a-z]/gi, '');
    return match && (match in config) ? match : false;
}

const Header = ({isNightMode, setNightMode}) => {
    const [language, setLanguage] = React.useState('en');
    const { t, i18n } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();
    const walletReducer = useSelector(state => state.walletReducer);
    const classes = useStyles();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    React.useEffect(() => {
        const cachedLanguage = i18n.language;
        if (!cachedLanguage) {
          return;
        }
    
        setLanguage(cachedLanguage);
    }, [i18n.language]);

    const urlParamNetwork = checkNetwork(location.pathname);

    if(urlParamNetwork && urlParamNetwork !== walletReducer.network) {
        dispatch(reduxActions.wallet.setNetwork(urlParamNetwork));
    }

    const handleNetworkSwitch = (event) => {
        dispatch(reduxActions.wallet.setNetwork(event.target.value));
    }

    React.useEffect(() => {
        if(!walletReducer.web3modal) {
            dispatch(reduxActions.wallet.createWeb3Modal());
        }
    }, [dispatch, walletReducer.web3modal]);

    const handleLanguageSwitch = event => {
        if (!event?.target?.value) return;
        const newLanguage = event.target.value
        return i18n.changeLanguage(newLanguage).then(() => setLanguage(newLanguage));
    };

    const languageDropdownOptions = {}
    Object.keys(localeToLanguageMap).forEach(locale => {
        languageDropdownOptions[locale] = localeToLanguageMap[locale]
    })

    const languageDropdownCustomRender = (locale) => {
        return locale.toUpperCase()
    }

    const navLinks = [
        { title: t('home'), path: 'https://beefy.finance' },
        { title: t('explore'), path: '/' },
        { title: t('docs'), path: 'https://docs.beefy.finance' },
    ];

    return (
        <AppBar className={[classes.navHeader, location.pathname === '/' ? classes.hasPortfolio : ''].join(' ')} position="static">
            <Toolbar disableGutters={true}>
                <Container maxWidth="xl" className={classes.navDisplayFlex}>
                    <Box className={classes.beefy}>
                        <img alt="BIFI" src={require('../../images/BIFI.svg').default} />
                        <Button onClick={() => {history.push('/')}}>Beefy.Finance</Button>
                    </Box>
                    <Hidden smDown>
                        <List component="nav" aria-labelledby="main navigation" className={classes.navDisplayFlex}>
                            {navLinks.map(({ title, path }) => (
                                    <ListItem key={title} button onClick={() => {window.location.href = path}}>
                                        <ListItemText primary={title} />
                                    </ListItem>
                            ))}
                            <IconButton onClick={setNightMode}>
                                {isNightMode ? <WbSunny /> : <NightsStay />}
                            </IconButton>
                            <CustomDropdown list={languageDropdownOptions} selected={language} handler={handleLanguageSwitch} css={{marginLeft: 10}} renderValue={languageDropdownCustomRender}/>
                            <CustomDropdown list={getAvailableNetworks(true)} selected={walletReducer.network} handler={handleNetworkSwitch} css={{marginLeft: 10}} />
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
