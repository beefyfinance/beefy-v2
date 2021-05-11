import React from "react";
import styles from "./styles"
import {Box, Button, Container, Grid, makeStyles, Typography} from "@material-ui/core";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import VisibilityIcon from '@material-ui/icons/Visibility';

const useStyles = makeStyles(styles);

const Portfolio = () => {
    const classes = useStyles();

    return (
        <Box className={classes.portfolio}>
            <Container maxWidth="xl">
                <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant={"h1"}>Portfolio</Typography>
                </Grid>
                <Grid item xs={6} className={classes.balance}>
                    <Button><VisibilityIcon /> Hide balance</Button>
                </Grid>
                </Grid>
                <Grid container spacing={5}>
                    <Grid item>
                        <Typography variant={"h2"}>0</Typography>
                        <Typography variant={"h3"}>Deposited</Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant={"h2"}>0</Typography>
                        <Typography variant={"h3"}>Total yield</Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant={"h2"}>0</Typography>
                        <Typography variant={"h3"}>Daily yield</Typography>
                    </Grid>
                </Grid>
                <Box display="flex">
                    <Box m="auto">
                        <Button className={classes.toggler}><ExpandLessIcon /></Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}

export default Portfolio;
