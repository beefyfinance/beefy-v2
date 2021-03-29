import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from "./components/header";
import { createMuiTheme, ThemeProvider, CssBaseline } from "@material-ui/core";
import './App.css'
import {useDispatch} from "react-redux";
import {config} from './config/config';
import reduxActions from "./features/redux/actions";

const Home = React.lazy(() => import(`./features/home`));
const Vault = React.lazy(() => import(`./features/vault`));
const Stats = React.lazy(() => import(`./features/stats`));

const PageNotFound = () => {
    return <div>Page not found.</div>;
}

const getNetworks = () => {
    const paths = [];

    for(let networks in config) {
        paths.push(networks);
    }

    return '/(|' + paths.join('|') + ')';
}

export default function App() {
    const storage = localStorage.getItem('nightMode');
    const [isNightMode, setNightMode] = React.useState(storage === null ? false : JSON.parse(storage));
    const theme = createMuiTheme({
        palette: {
            type: (isNightMode ? "dark" : "light"),
        },
    });

    const homePath = getNetworks();
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(reduxActions.prices.fetchPrices());
    }, [dispatch]);

    React.useEffect(() => {
        localStorage.setItem('nightMode', JSON.stringify(isNightMode));
    }, [isNightMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Header isNightMode={isNightMode} setNightMode={() => setNightMode(!isNightMode)} />
                <React.Suspense fallback={<div className="loader"/>}>
                    <Switch>
                        <Route exact path={homePath} key={Date.now()}>
                            <Home />
                        </Route>
                        <Route strict sensitive exact path="/stats">
                            <Stats />
                        </Route>
                        <Route strict sensitive exact path="/:network/vault/:id">
                            <Vault />
                        </Route>
                        <Route>
                            <PageNotFound />
                        </Route>
                    </Switch>
                </React.Suspense>
            </Router>
        </ThemeProvider>
    );
}