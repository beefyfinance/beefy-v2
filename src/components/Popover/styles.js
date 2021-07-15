const styles = theme => ({
    container: {
    },
    popover: {
        padding: '15px',
        background: '#272B4A',
        border: '3px solid #484F7F',
        filter: 'drop-shadow(0px 0px 40px #0A0F2B)',
        borderRadius: '15px',
        margin: '15px auto',
        maxWidth: '350px'
    },
    trigger: {
        display: "flex",
        alignItems: "center",
        '&:hover': {
            cursor: 'pointer'
        }
    },
    title: {
        fontFamily: 'Proxima Nova',
        fontStyle: 'normal',
        background: '#272B4A',
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '18px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: '#FFFFFF',
    },
    divider: {
        opacity: '0.4',
        border: '1px solid #8585A6',
        margin: '10px auto'
    },
    size_sm: {
        width: '16px',
        height: '16px'
    },
    size_md: {
        width: '20px',
        height: '20px'     
    },
    size_lg: {
        width: '24px',
        height: '24px'  
    },
    arrow: {
        position: "absolute",
        "&:before": {
            position: 'absolute',
            content: '""',
            height: 0,
            width: 0,
            zIndex: 15,
            borderStyle: 'solid'
        },
        "&:after": {
            position: 'absolute',
            content: '""',
            height: 0,
            width: 0,
            zIndex: 14,
            borderStyle: 'solid'
        }
    },
    popper: {
        '&[x-placement*="end"] .popover': {
            marginRight: -30
        },
        '&[x-placement*="start"] .popover': {
            marginLeft: -30
        },
        '&[x-placement*="top"] span': {
            bottom: 16,
            width: 0, 
            height: 0, 
            "&:before": {
                marginTop: "-4px",
                borderWidth: "12px",
                borderColor: "#272B4A transparent transparent transparent",
            },
            "&:after": {
                borderWidth: "12px",
                borderColor: "#484F7F transparent transparent transparent",
            },
        },
        '&[x-placement*="bottom"] span': {
            top: -8,
            width: 0, 
            height: 0, 
            "&:before": {
                top: 4,
                borderWidth: "12px",
                borderColor: 'transparent transparent #272B4A transparent',
            },
            "&:after": {
                borderWidth: "12px",
                borderColor: "transparent transparent #484F7F transparent",
            },
        },
        '&[x-placement*="end"] span': {
            "&:before": {
                right: '-12px'
            },
            "&:after": {
                right: '-12px'
            }
        },
        '&[x-placement*="start"] span': {
            "&:before": {
                left: '-12px'
            },
            "&:after": {
                left: '-12px'
            }
        }
    }
})

export default styles;