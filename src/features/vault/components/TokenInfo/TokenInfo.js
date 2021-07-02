import React from 'react';
import {config} from '../../../../config/config'
import {makeStyles, Typography} from '@material-ui/core';
import styles from './styles';
import LinkButton from '../../../../components/LinkButton/LinkButton';
import Card from "../Card";
import CardHeader from "../CardHeader";
import CardContent from "../CardContent";

const useStyles = makeStyles(styles);

const TokenInfo = ({ token, network }) => {
    const classes = useStyles();

    const { symbol, website, address, description} = token;

    return (
        <Card>
            <CardHeader>
                <div>
                    <div>
                        <Typography className={classes.cardTitle}>{symbol}</Typography>
                    </div>
                    <div>
                        <Typography className={classes.cardSubtitle}>Asset details</Typography>
                    </div>
                </div>
                <div className={classes.cardActions}>
                    {website ? (
                        <div className={classes.cardAction}>
                            <LinkButton href={website} text="Website" />
                        </div>
                    ) : null}
                    <div className={classes.cardAction}>
                        <LinkButton href={`${config[network].explorerUrl}/token/${address}`}  className={classes.cardAction} text="Token Contract" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Typography className={classes.text}>
                    {description ? description : 'No token description available.'}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default TokenInfo;
