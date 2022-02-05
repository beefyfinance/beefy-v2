import React from 'react';
import {
  Container,
  Box,
  Grid,
  Divider,
  Typography,
  Card,
  CardContent,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import grass from '../../images/nfts/grass.svg';
const useStyles = makeStyles(styles as any);

export const BeefyAvatars = () => {
  const props = { bgImage: grass };
  const classes = useStyles(props);

  return (
    <Box className={classes.avatars} pt={5}>
      <Container maxWidth="md">
        <Box mb={5} className={classes.center}>
          <img alt="Avatars" src={require('../../images/nfts/beefy-avatars.svg').default} />
        </Box>
        <Box my={5}>
          <Grid container spacing={2}>
            <Grid className={classes.center} item xs>
              <Card className={classes.card}>
                <CardContent></CardContent>
              </Card>
            </Grid>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Grid className={classes.center} item xs>
              <Card className={classes.card}>
                <CardContent>
                  <Box textAlign="center">
                    <Typography className={classes.title}>Mint your avatar</Typography>
                    <img
                      alt="Avatars"
                      height={120}
                      src={require('../../images/nfts/mint.svg').default}
                    />
                  </Box>
                  <Box className={classes.center}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography className={classes.price}>
                        Price : <span>$100</span>
                      </Typography>
                      <span style={{ fontSize: '10px' }}>(Per Avatar)</span>
                    </Box>
                    <Box>
                      <Button className={classes.btnMint} size="small">
                        Mint
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};
