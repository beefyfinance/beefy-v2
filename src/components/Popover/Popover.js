import { makeStyles, Typography, Divider, Box, Popper } from "@material-ui/core";
import React, { useState, useRef } from "react";
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import outlinedQuestionMark from "./outlined.svg";
import solidQuestionMark from "./solid.svg";
import styles from "./styles"

const useStyles = makeStyles(styles);

const Popover = ({ title, description, solid, size = 'sm', placement = 'top-end' }) => {
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const popperId = open ? 'simple-popper' : undefined;
    const [arrowRef, setArrowRef] = useState(null);

    const handleClick = e => {
      setAnchorEl(anchorEl ? null : e.currentTarget);
    };

    return (
        <div className={classes.container}>
            <div className={classes.trigger}>
                <img 
                    src={solid ? solidQuestionMark : outlinedQuestionMark} 
                    className={classes[`size_${size}`]}
                    onClick={handleClick} 
                />
                <span></span>
            </div>
            <Popper 
                id={popperId} 
                open={open} 
                anchorEl={anchorEl} 
                placement={placement}
                disablePortal={true}
                modifiers={{
                    flip: {
                        enabled: true,
                    },
                    preventOverflow: {
                        enabled: true,
                        boundariesElement: 'scrollParent',
                    },
                    arrow: {
                        enabled: true,
                        element: arrowRef,
                      },
                    }}
                className={classes.popper}
            >
                <span className={classes.arrow} ref={setArrowRef} />
                <div className={[classes.popover, 'popover'].join(' ')}>
                    <Typography className={classes.title}>{title}</Typography>
                    <Divider className={classes.divider} />
                    <Typography>{description}</Typography>
                </div>
            </Popper>
        </div>  
    )
}

export default Popover;
