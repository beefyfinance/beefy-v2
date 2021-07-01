import {makeStyles, Typography, Divider} from "@material-ui/core";
import React, {useState} from "react";
import styles from "./styles"
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
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
                        <Typography className={classes.title}>What does this mean?</Typography>
                        <Divider className={classes.divider}/>
                        <Typography>Low complexity strategies have few, if any, moving parts and their code is easy to read and debug. There is a direct correlation between code complexity and implicit risk. A simple strategy effectively mitigates implementation risks.</Typography>
                    </div>
                </ClickAwayListener>
            )}
        </div>

    )
}

export default Tooltip;
