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
        <div className={classes.container}>
            <Box display="flex" alignItems="center">
                <img 
                    alt="fire" 
                    src={require('../../../../images/fire.png').default} 
                    className={classes.boostImg}
                />
                <Typography className={classes.h1}>Boost</Typography>
                <Box ml={0.5}>
                    <Popover 
                        title="Boost Title"
                        description="Short explanation about vault boosting."
                        solid
                        size="md"
                        placement="top-start"
                    />
                </Box>
                <Box flexGrow={1}>
                    <Typography className={classes.h2} align={"right"}>{balance}</Typography>
                </Box>
            </Box>
            <Typography className={classes.body1} align={"right"}>Receipt Token balance</Typography>

            <Button 
                disabled={true} 
                className={classes.submit} 
                fullWidth={true}
                onClick={onClick}
            >
                {variant} Receipt Token
            </Button>
        </div>
    )
}

export default BoostWidget;