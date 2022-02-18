import { Box, Button, Container, Grid, makeStyles, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Stats } from './Stats';
import { VaultsStats } from './VaultsStats';
import { styles } from './styles';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import { useTheme } from '@material-ui/core/styles';
import { selectUserGlobalStats } from '../../../data/selectors/apy';
import { selectIsBalanceHidden } from '../../../data/selectors/wallet';
import { setToggleHideBalance } from '../../../data/reducers/wallet/wallet';

const useStyles = makeStyles(styles as any);
export const Portfolio = () => {
  const classes = useStyles();
  const theme = useTheme();

  const dispatch = useDispatch();
  const updateHideBalance = () => {
    dispatch(setToggleHideBalance());
  };
  const globalStats = useSelector(selectUserGlobalStats);
  const hideBalance = useSelector(selectIsBalanceHidden);

  const t = useTranslation().t;

  return (
    <Box className={classes.portfolio}>
      <Container maxWidth="lg">
        <Grid container>
          <Grid className={classes.separator} item xs={12} lg={6}>
            <Box className={classes.titles}>
              <Typography variant="h3" className={classes.title}>
                {t('Portfolio-Portfolio')}
              </Typography>
              <Button size="small" className={classes.btnHide} onClick={updateHideBalance}>
                {hideBalance ? (
                  <VisibilityOutlinedIcon htmlColor={`${theme.palette.primary.main}`} />
                ) : (
                  <VisibilityOffOutlinedIcon htmlColor={`${theme.palette.primary.main}`} />
                )}
              </Button>
            </Box>
            <Stats stats={globalStats} blurred={hideBalance} />
          </Grid>
          <Grid item xs={12} lg={6}>
            <Box className={classes.vaults}>
              <Typography variant="h3" className={classes.title2}>
                {t('Vault-platform')}
              </Typography>
              <Box>
                <VaultsStats {...({} as any)} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
