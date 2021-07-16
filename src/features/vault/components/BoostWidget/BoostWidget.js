import React from "react";
import {
    Box,
    Button,
    makeStyles,
    Typography
} from "@material-ui/core";

import styles from "./styles"
import Popover from "../../../../components/Popover";

const useStyles = makeStyles(styles);

const BoostWidget = ({ onClick, balance, variant }) => {
    const classes = useStyles();

    return (
        <Box p={4} className={classes.boostContainer}>
            <Box display="flex" alignItems="center">
                <Box lineHeight={0}>
                    <img alt="fire" src={require('../../../../images/fire.png').default} />
                </Box>
                <Box>
                    <Typography variant={"h1"}>Boost</Typography>
                </Box>
                <Popover 
                    title="H"
                    description="HH"
                    solid
                />
                <Box flexGrow={1}>
                    <Typography variant={"h2"} align={"right"}>{balance}</Typography>
                </Box>
            </Box>
            <Typography align={"right"}>Receipt Token balance</Typography>
            <Box pt={4}>
                <Button 
                    disabled={true} 
                    className={classes.btnSubmit} 
                    fullWidth={true}
                    onClick={onClick}
                >
                    {variant === 'stake' ? 'Stake' : 'Unstake'} Receipt Token
                </Button>
            </Box>
        </Box>
    )
}

export default BoostWidget;