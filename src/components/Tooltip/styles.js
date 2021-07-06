const styles = (theme) => ({
    container: {
        position: 'relative',
    },
    tooltip: {
        position: 'absolute',
        right: 0,
        bottom: '80px',
        width: '417px',
        padding: '15px',
        background: '#272B4A',
        border: '3px solid #484F7F',
        boxSizing: 'border-box',
        filter: 'drop-shadow(0px 0px 40px #0A0F2B)',
        borderRadius: '15px',
        zIndex: 10,
        '& .MuiSvgIcon-root': {
            fontSize: '80px',
            position: 'absolute',
            bottom: -45,
            right: 45,
            color: '#272B4A',
        },
        '&::before': {
            position: 'absolute',
            content: '" "',
            border: '19px solid',
            height: 0,
            width: 0,
            left: 'auto',
            bottom: -35,
            right: 21,
            zIndex: 12,
            borderColor: '#272B4A transparent transparent transparent'
        },
        '&::after': {
            position: 'absolute',
            content: '" "',
            border: '20px solid',
            height: 0,
            width: 0,
            left: 'auto',
            bottom: -40,
            right: 20,
            zIndex: 11,
            borderColor: '#484F7F transparent transparent transparent'  
        }
    },
    content: {
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
    }
})

export default styles;