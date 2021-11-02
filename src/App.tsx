import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import { reduxActions } from './features/redux/actions';
import { useTranslation } from 'react-i18next';
import { ScrollToTop } from './components/ScrollToTop';

const Home = React.lazy(() => import(`./features/home`));
const Vault = React.lazy(() => import(`./features/vault`));
const Boost = React.lazy(() => import(`./features/boost`));

const PageNotFound = () => {
  const { t } = useTranslation();
  return <div>{t('Page-Not-Found')}</div>;
};

export const App = () => {
  const dispatch = useDispatch();
  // const storage = localStorage.getItem('nightMode');
  //const [isNightMode, setNightMode] = React.useState(storage === null ? false : JSON.parse(storage));
  const [isNightMode, setNightMode] = React.useState(true);
  const theme = createTheme({
    palette: {
      type: isNightMode ? 'dark' : 'light',
      background: {
        dark: '#1B203A',
        default: '#232743',
        paper: isNightMode ? '#272B4A' : '#FFFFFF',
        light: '#313759',
      } as any, // TODO: fix any
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          body: {
            backgroundColor: isNightMode ? '#1B203A' : '#fff',
          },
        },
      },
    },
    typography: {
      fontFamily: ['Proxima Nova', 'sans-serif'].join(','),
    },
  });

  React.useEffect(() => {
    const initiate = async () => {
      await dispatch(reduxActions.prices.fetchPrices());
    };
    initiate();
  }, [dispatch]);

  React.useEffect(() => {
    localStorage.setItem('nightMode', JSON.stringify(isNightMode));
  }, [isNightMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <Header isNightMode={isNightMode} setNightMode={() => setNightMode(!isNightMode)} />
        <React.Suspense fallback={<div className="loader" />}>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route strict sensitive exact path="/:network/vault/:id">
              <Vault />
            </Route>
            <Route strict sensitive exact path="/:network/boost/:id">
              <Boost />
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
