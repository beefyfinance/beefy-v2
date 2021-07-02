const styles = {
    container: {
        display: 'flex',
        alignItems: 'flex-end',
        marginBottom: props => props.size === 'lg' ? '10px' : '5px'

    },
    barsContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        margin: 'auto auto 3px 10px'
    },
    label: props => ({
        color: props.labelColor,
        fontFamily: 'Proxima Nova',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: props.size === 'lg' ? '36px' : '24px',
        lineHeight: props.size === 'lg' ? '30px' : '24px',
        textAlign: 'center',
        letterSpacing: '-0.1px',
    }), 
    sm: props => ({
        backgroundColor: props.smColor,
        width: '5px',
        height: props.size === 'lg' ? '13px': '9px',
        marginRight: '4px',
        borderRadius: '2px'
    }),
    md: props => ({
        backgroundColor: props.mdColor,
        width: '5px',
        height: props.size === 'lg' ? '21px' : '17px',
        marginRight: '4px',
        borderRadius: '2px'
    }),
    lg: props => ({
        backgroundColor:  props.lgColor,
        width: '5px',
        height: props.size === 'lg' ? '29px': '25px',
        borderRadius: '2px'
    })
};

export default styles;
