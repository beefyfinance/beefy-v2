import React from "react";
import { makeStyles } from "@material-ui/core";
import styles from "./styles"

const useStyles = makeStyles(styles);

const PortfolioItem = () => {
    const classes = useStyles();

    return (
        <div>
            Vault
        </div>
    )
}

export default PortfolioItem;
