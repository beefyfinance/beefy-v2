import * as React from "react";
import {Container, makeStyles} from "@material-ui/core"

const useStyles = makeStyles({
    navDisplayFlex: {
        display: `flex`,
        justifyContent: `space-between`
    },
    linkText: {
        textDecoration: `none`,
        textTransform: `uppercase`,
    }
});

console.log("Stats page loaded.")

const Stats = () => {
    const classes = useStyles();

    return (
        <div className="App">
            <Container maxWidth="lg" className={classes.linkText}>
                <h1>This is stats page</h1>
                <h2>Import stats from dashboard.beefy.finance</h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                    minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum."
                </p>

            </Container>
        </div>
    );
};

export default Stats;
