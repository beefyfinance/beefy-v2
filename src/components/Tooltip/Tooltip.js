import {makeStyles, Typography, Divider} from "@material-ui/core";
import React, {useState} from "react";
import styles from "./styles"
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

const useStyles = makeStyles(styles);

const Tooltip = ({ title, description, children}) => {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={classes.container}>
            <div onClick={() => setIsOpen(true)} className={classes.content}>
                {children}
            </div>
            {isOpen && (
                <ClickAwayListener onClickAway={() => setIsOpen(false)}>
                    <div className={classes.tooltip}>
                        <Typography className={classes.title}>{title}</Typography>
                        <Divider className={classes.divider}/>
                        <Typography>{description}</Typography>
                    </div>
                </ClickAwayListener>
            )}
        </div>

    )
}

export default Tooltip;
