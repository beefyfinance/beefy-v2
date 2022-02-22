import React from 'react';
import {
  Container,
  Box,
  Grid,
  Typography,
  Card,
  Button,
  Divider,
  useMediaQuery,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import grass from '../../images/nfts/grass.svg';
import { Filter } from './Components/Filter';
import { useAvatarsInfo } from './hooks/useAvatarsInfo';

import { CowCard } from './Components/CowCard';

const useStyles = makeStyles(styles as any);

export const BeefyAvatars = () => {
  const props = { bgImage: grass };
  const classes = useStyles(props);
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 960px)');
  const [filter, setFilter] = React.useState({});

  const traits = [
    { id: 0, generated: 1, percent: '0.01', divier: true },
    { id: 1, generated: 1, percent: '0.01', divier: true },
    { id: 2, generated: 1, percent: '0.01', divier: true },
    { id: 3, generated: 1, percent: '0.01', divier: true },
    { id: 4, generated: 1, percent: '0.01', divier: true },
    { id: 5, generated: 1, percent: '0.01', divier: true },
    { id: 6, generated: 1, percent: '0.01', divier: true },
    { id: 7, generated: 1, percent: '0.01', divier: false },
  ];

  const COWS = useAvatarsInfo();

  return (
    <>
      {console.table(COWS[0])}
      <Box className={classes.avatars} pt={5}>
        <Container maxWidth="md">
          <Box mb={5} className={classes.center}>
            <img alt="Avatars" src={require('../../images/nfts/beefy-avatars.svg').default} />
          </Box>
          <Box my={5}>
            <Grid container spacing={2}>
              <Grid className={classes.center} item xs={12} md={4} lg={4}>
                <Card className={classes.card}>
                  <Typography className={classes.title}>
                    {' '}
                    {t('Avatars-Available', { number: 4000 })}
                  </Typography>
                  <img
                    alt="Avatars"
                    height={120}
                    src={require('../../images/nfts/mint.svg').default}
                  />
                  <Typography className={classes.title}>
                    {t('Avatars-Minted', { number: 4000 })}
                  </Typography>
                </Card>
              </Grid>
              <Grid className={classes.content} item xs={12} md={8} lg={8}>
                <Box className={classes.info}>
                  <Typography className={classes.title2}>{t('Avatars-About-Title')}</Typography>
                  <Typography className={classes.text}>{t('Avatars-About-Content')}</Typography>
                </Box>
                <Box className={classes.buttons}>
                  <Button className={classes.btnMore}>{t('Avatars-Btn-More')}</Button>
                  <Button className={classes.btnMint}>{t('Avatars-Btn-Mint')}</Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
        <Container maxWidth="lg">
          <Box className={classes.center}>
            <Typography className={classes.title2}>{t('Avatars-Generated-Title')}</Typography>
          </Box>
          <Grid container>
            {traits.map(trait => {
              return (
                <>
                  <Grid className={classes.autoGrid} key={trait.id} item xs={6} md="auto" lg="auto">
                    <Box className={classes.trait}>
                      <Typography className={classes.traitTitle}>
                        {t('Avatars-Trait', { number: trait.id })}
                      </Typography>
                      <Typography className={classes.traitText}>
                        {t('Avatars-Generated')} <span>{trait.generated}</span>
                      </Typography>
                      <Typography className={classes.traitText}>
                        {t('Avatars-Percent')} <span>{trait.percent}</span>
                      </Typography>
                    </Box>
                  </Grid>
                  {trait.divier && !isMobile && (
                    <Divider className={classes.divider} orientation="vertical" flexItem />
                  )}
                </>
              );
            })}
          </Grid>
          <Box mt={5}>
            <Filter sortConfig={filter} setSortConfig={setFilter} />
          </Box>
          <Box className={classes.listContainer}>
            {COWS &&
              COWS[0].map((cow: any) => {
                return <CowCard cow={cow} />;
              })}
            {COWS &&
              COWS[0].map((cow: any) => {
                return <CowCard cow={cow} />;
              })}
            {COWS &&
              COWS[0].map((cow: any) => {
                return <CowCard cow={cow} />;
              })}
          </Box>
        </Container>
      </Box>
    </>
  );
};
