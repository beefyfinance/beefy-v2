const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
    },
    barsContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        margin: 'auto auto 3px 10px'
    },
    label: {
        color: props => props.labelColor,
        fontFamily: 'Proxima Nova',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '36px',
        lineHeight: '0',
        textAlign: 'center',
        letterSpacing: '-0.1px',
    }, 
    sm: {
        backgroundColor: props => props.smColor,
        width: '5px',
        height: '13px',
        marginRight: '4px',
        borderRadius: '2px'
    },
    md: {
        backgroundColor: props => props.mdColor,
        width: '5px',
        height: '21px',
        marginRight: '4px',
        borderRadius: '2px'
    },
    lg: {
        backgroundColor: props => props.lgColor,
        width: '5px',
        height: '29px',
        borderRadius: '2px'
    }
};

export default styles;
