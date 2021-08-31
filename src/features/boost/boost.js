import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Link,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import Loader from 'components/loader';
import { ArrowLeft, Language, Telegram, Twitter } from '@material-ui/icons';
import styles from './styles';
import { isEmpty } from 'helpers/utils';
import { useTranslation } from 'react-i18next';
import AssetsImage from 'components/AssetsImage';
import reduxActions from 'features/redux/actions';
import { formatApy, formatUsd } from '../../helpers/format';

const useStyles = makeStyles(styles);

const Boost = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  let { id } = useParams();
  const { vault } = useSelector(state => ({
    vault: state.vaultReducer,
  }));

  const [isLoading, setIsLoading] = React.useState(true);
  const [item, setItemData] = React.useState(null);

  React.useEffect(() => {
    if (!isEmpty(vault.boosts) && vault.boosts[id]) {
      setItemData(vault.boosts[id]);
    } else {
      history.push('/error');
    }
  }, [vault.boosts, id, history]);

  React.useEffect(() => {
    if (item) {
      setIsLoading(false);
      dispatch(reduxActions.vault.fetchBoosts(item));
    }
  }, [item, dispatch]);

  return (
    <Container className={classes.vaultContainer} maxWidth="lg">
      {isLoading ? (
        <Loader message="Getting boost data..." />
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Button
              className={classes.btnGoBack}
              onClick={() => {
                history.push('/' + item.network + '/vault/' + item.poolId);
              }}
            >
              <ArrowLeft /> Back to Vault
            </Button>
            <Box className={classes.title} display="flex" alignItems="center">
              <Box>
                <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
              </Box>
              <Box>
                <Typography variant={'h1'}>{item.name} vault</Typography>
              </Box>
              <Box lineHeight={0}>
                <Avatar
                  alt="Fire"
                  src={require('../../images/fire.png').default}
                  imgProps={{
                    style: { objectFit: 'contain' },
                  }}
                />
              </Box>
              <Box>
                <Typography variant={'h2'}>{t('Boost')}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className={classes.summary} display="flex" alignItems="center">
              <Box flexGrow={1} p={2}>
                <Typography variant={'h1'}>0</Typography>
                <Typography>{t('Receipt-Balance')}</Typography>
              </Box>
              <Box p={2} textAlign={'right'}>
                <Typography variant={'h1'}>{formatUsd(item.tvl)}</Typography>
                <Typography>{t('Total-Value-Locked')}</Typography>
              </Box>
              <Box p={2} textAlign={'right'}>
                <Typography variant={'h1'}>{formatApy(item.apr)}</Typography>
                <Typography>{t('Stake-APR')}</Typography>
              </Box>
              <Box p={2} textAlign={'right'}>
                <Typography variant={'h1'}>0%</Typography>
                <Typography>{t('Your pool %')}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.splitPaper}>
              <Box display={'flex'}>
                <Box className={classes.splitA}>
                  <Typography>
                    0 {item.token} <span>$0.00</span>
                  </Typography>
                  <Typography variant={'h2'}>{t('Stake-Staked')}</Typography>
                  <Box textAlign={'center'}>
                    <Button className={classes.btnSubmit}>{t('Stake-Button-Stake')}</Button>
                  </Box>
                </Box>
                <Box className={classes.splitB}>
                  <Typography>0 {item.earnedToken}</Typography>
                  <Typography variant={'h2'}>{t('Stake-Rewards')}</Typography>
                  <Box textAlign={'center'}>
                    <Button className={classes.btnClaim}>{t('Stake-Button-Claim-Rewards')}</Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            {item.partners.map(partner => (
              <Paper className={classes.partner} key={partner}>
                <Grid container>
                  <Grid item xs={12} md={6}>
                    <img
                      alt={partner.name}
                      src={require('../../images/' + partner.logo).default}
                      height="60"
                    />
                  </Grid>
                  <Grid item xs={12} md={6} className={classes.social}>
                    {partner.social.telegram ? (
                      <Link href={partner.social.telegram}>
                        <Telegram /> Telegram
                      </Link>
                    ) : (
                      ''
                    )}
                    {partner.social.twitter ? (
                      <Link href={partner.social.twitter}>
                        <Twitter /> Twitter
                      </Link>
                    ) : (
                      ''
                    )}
                    {partner.website ? (
                      <Link href={partner.website}>
                        <Language /> {partner.website}
                      </Link>
                    ) : (
                      ''
                    )}
                  </Grid>
                  <Grid item xs={12} className={classes.partnerBody}>
                    {partner.text}
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Boost;
