import React from "react";
import {
    Box,
    Button,
    makeStyles,
    Typography
} from "@material-ui/core"
import {useTranslation} from "react-i18next"

import styles from "./styles"
import Popover from "../../../../components/Popover"

const useStyles = makeStyles(styles)

const BoostWidget = ({ onClick, balance, s_stake }) => {
    const classes = useStyles()
    const t = useTranslation().t
    return (
        <div className={classes.container}>
            <Box display="flex" alignItems="center">
                <img 
                    alt="fire" 
                    src={require('../../../../images/fire.png').default} 
                    className={classes.boostImg}
                />
                <Typography className={classes.h1}>{t( 'Boost-Noun')}</Typography>
                <Box ml={0.5}>
                    <Popover 
                        title={t( 'Boost-WhatIs')}
                        content={t( 'Boost-Explain')}
                        solid
                        size="md"
                        placement="top-end"
                    />
                </Box>
                <Box flexGrow={1}>
                    <Typography className={classes.h2} align={"right"}>{balance}</Typography>
                </Box>
            </Box>
            <Typography className={classes.body1} align={"right"}>
                {t( 'Boost-Balance')}
            </Typography>

            <Button disabled={true} 
                        className={classes.submit} 
                        fullWidth={true}
                        onClick={onClick}>
                {s_stake}
            </Button>
        </div>
    ) 
} 

export default BoostWidget;
