import {Box} from "@material-ui/core";
import React from "react";

const Loader = ({message}) => {
    return (<Box textAlign={'center'}>{message}<Box className="loader" /></Box>
    )
}

export default Loader;
