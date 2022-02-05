import { Container, Box, Grid, Typography, Card, Button, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import grass from '../../images/nfts/grass.svg';
const useStyles = makeStyles(styles as any);

export const BeefyAvatars = () => {
  const props = { bgImage: grass };
  const classes = useStyles(props);
  const { t } = useTranslation();

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

  return (
    <Box className={classes.avatars} pt={5}>
      <Container maxWidth="md">
        <Box mb={5} className={classes.center}>
          <img alt="Avatars" src={require('../../images/nfts/beefy-avatars.svg').default} />
        </Box>
        <Box my={5}>
          <Grid container spacing={2}>
            <Grid className={classes.center} item xs={4}>
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
            <Grid className={classes.content} item xs>
              <Box textAlign="left">
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
        <Box my={5} className={classes.center}>
          <Typography className={classes.title2}>{t('Avatars-Generated-Title')}</Typography>
        </Box>
        <Grid container>
          {traits.map(trait => {
            return (
              <>
                <Grid key={trait.id} item xs>
                  <Box textAlign="center">
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
                {trait.divier && (
                  <Divider className={classes.divider} orientation="vertical" flexItem />
                )}
              </>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};
