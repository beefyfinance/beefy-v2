import * as React from "react";
import { useHistory } from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import rdx from '../../features/redux/actions';
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
    TextField,
    Avatar, Button
} from "@material-ui/core";
import {Menu, WbSunny, NightsStay, Lens} from "@material-ui/icons";
import styles from "./styles"

const useStyles = makeStyles(styles);

const navLinks = [
    { title: 'barn', path: 'https://barn.beefy.finance' },
    { title: 'vote', path: 'https://vote.beefy.finance' },
    { title: 'gov', path: 'https://gov.beefy.finance' },
    { title: 'stats', path: '/stats' },
    { title: 'docs', path: 'https://docs.beefy.finance' },
    { title: 'buy', path: 'https://classic.openocean.finance/exchange/BNB' },
];

const Header = ({isNightMode, setNightMode}) => {
    const history = useHistory();
    const classes = useStyles();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const dispatch = useDispatch()
    const currentNetwork = useSelector(state => state.wallet.network);

    const handleNetworkSwitch = (event) => {
        dispatch(rdx.wallet.setNetwork(event.target.value))
        history.push('/');
    }

    dispatch(rdx.wallet.setNetwork(currentNetwork))

    return (
        <AppBar className={classes.navHeader} position="static">
            <Toolbar>
                <Container maxWidth="xl" className={classes.navDisplayFlex}>
                    <Box className={classes.beefy}>
                        <img alt="BIFI" src={require('../../images/BIFI.svg').default} height={'36px'}/>
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
                            <Box style={{marginTop: '4px'}}>
                                <FormControl variant="outlined" className={classes.netControl}>
                                    <InputLabel id="switch-network-label">Switch Network</InputLabel>
                                    <Select labelId="switch-network-label" value={currentNetwork} onChange={handleNetworkSwitch} label="Switch Network">
                                        <MenuItem value={'bsc'}>Binance Smart Chain</MenuItem>
                                        <MenuItem value={'heco'}>Heco</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box style={{marginTop: '4px'}}>
                                <FormControl noValidate autoComplete="off" className={classes.walletControl}>
                                    <Box style={{position: 'absolute', left:0, top: 0}}>
                                        <Avatar className={classes.walletStatus}><Lens /></Avatar>
                                    </Box>
                                    <TextField label="Wallet" value="0x6833...BCdA" InputProps={{readOnly: true}} variant="outlined" />
                                </FormControl>
                            </Box>
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
