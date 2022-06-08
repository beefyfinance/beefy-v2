import { Button, Container, Grid, makeStyles } from '@material-ui/core';
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
import { useAppDispatch, useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles);
export const Portfolio = () => {
  const classes = useStyles();
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const updateHideBalance = () => {
    dispatch(setToggleHideBalance());
  };
  const globalStats = useAppSelector(selectUserGlobalStats);
  const hideBalance = useAppSelector(selectIsBalanceHidden);

  const { t } = useTranslation();

  return (
    <div className={classes.portfolio}>
      <Container maxWidth="lg">
        <Grid container>
          <Grid className={classes.separator} item xs={12} md={6}>
            <div className={classes.title}>
              {t('Portfolio-Portfolio')}{' '}
              <Button size="small" className={classes.btnHide} onClick={updateHideBalance}>
                {hideBalance ? (
                  <VisibilityOutlinedIcon htmlColor={`${theme.palette.primary.main}`} />
                ) : (
                  <VisibilityOffOutlinedIcon htmlColor={`${theme.palette.primary.main}`} />
                )}
              </Button>
            </div>
            <Stats stats={globalStats} blurred={hideBalance} />
          </Grid>
          <Grid item xs={12} md={6} className={classes.vaults}>
            <div className={classes.title}>{t('Vault-platform')}</div>
            <VaultsStats />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};
