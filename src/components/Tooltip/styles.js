const styles = theme => ({
    container: {
        position: 'relative',
        display: 'inline-block'
    },
    tooltip: props => ({
        position: 'absolute',
        right: props.direction === 'right' ? -35 : 'auto',
        left: props.direction != 'right' ? -35 : 'auto',
        bottom: props.direction === 'right' ? '80px': '40px',
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
            left: props.direction != 'right' ? 21 : 'auto',
            bottom: -35,
            right: props.direction === 'right' ? 21 : 'auto',
            zIndex: 12,
            borderColor: '#272B4A transparent transparent transparent'
        },
        '&::after': {
            position: 'absolute',
            content: '" "',
            border: '20px solid',
            height: 0,
            width: 0,
            left: props.direction != 'right' ? 20 : 'auto',
            bottom: -40,
            right: props.direction === 'right' ? 20 : 'auto',
            zIndex: 11,
            borderColor: '#484F7F transparent transparent transparent'  
        }
    }),
    content: {
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
    }
})

export default styles;