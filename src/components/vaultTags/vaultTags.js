import {makeStyles, Typography} from "@material-ui/core";
import * as React from "react";
import styles from "./styles"

const useStyles = makeStyles(styles);

const DisplayTags = ({tags}) => {
    const classes = useStyles();
    const getText = (name) => {
        switch(name) {
            case 'low':
                return 'Low Risk';
            case 'recent':
                return 'New';
            default:
                return name;
        }
    }

    return (
        tags.map(item => (
            <Typography className={[classes.tags, classes[item + 'Tag']].join(' ')} display={'inline'} key={item}>{getText(item)}</Typography>
        ))
    );
}

export default DisplayTags;